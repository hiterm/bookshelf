# Node.js API を bookshelf リポジトリへ移植する

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

この文書はリポジトリルートの `.agent/PLANS.md` に従って保守する。実装者は各マイルストーンの開始時と完了時にこの文書を更新し、発見事項と判断理由を残す。

## Purpose / Big Picture

現在は React/Vite フロントエンドの `bookshelf` と Rust 製 GraphQL API の `bookshelf-api` が別リポジトリ、別リリースとして運用されている。この変更では、既存の PostgreSQL データ、Auth0 認証、GraphQL クライアントを変更せずに、Node.js 24 と TypeScript で API を `bookshelf/api/` に再実装する。完了後は一つの pull request、lockfile、CI でフロントと API の契約を検証できる。

成功は、同じ PostgreSQL データに対して Rust 版と Node.js 版が同じ GraphQL schema、正常応答、公開エラー、履歴、復元、undo の結果を返すこと、既存の `e2e-integration` が Node.js 版に対して無変更で通ること、本番を安全に切り替えて Rust 版へ切り戻せることで確認する。移植中は Rust 版を参照実装として残す。

## Progress

- [x] (2026-09-08 00:00Z) 両リポジトリの構成、GraphQL schema、認証契約、Operation/Revision 設計、CI とデプロイを調査した。
- [x] (2026-09-08 00:00Z) 配置、主要ライブラリ、DB互換、段階移行の基本方針を決めた。
- [ ] Milestone 0 の契約固定と差分テスト基盤を実装する。
- [ ] Milestone 1 の API 骨格、設定、認証、migration runner を実装する。
- [ ] Milestone 2 の読み取り API を実装する。
- [ ] Milestone 3 の単一エンティティ mutation と履歴記録を実装する。
- [ ] Milestone 4 の import、merge、restore、undo を実装する。
- [ ] Milestone 5 の契約試験、コンテナ、CI、運用文書を完成させる。
- [ ] Milestone 6 の段階的リリースと切り戻し確認を行う。
- [ ] 安定期間後に Rust リポジトリを読み取り専用化する。

## Surprises & Discoveries

- Observation: API は CRUD だけでなく、全 mutation が一つの `operation` と不変の revision 群を同じ PostgreSQL transaction に記録する履歴システムである。
  Evidence: `bookshelf-api/docs/architecture/event-recording.md` は create、update、delete、restore、import、merge の全てにこの不変条件を課している。
- Observation: frontend は既に Node.js 24、pnpm、Vitest、Playwright、`jose` を使用しており、Node.js API を同じ lockfile に統合できる。
  Evidence: ルート `package.json` の `engines.node` は `24.x` である。
- Observation: frontend CI は固定 Rust API image と Rust API `main` の双方を別 job で試験している。この二重互換試験は移植時の差分検出に転用できる。
  Evidence: `.github/workflows/ci.yml` の `test-integration` と `test-integration-api-main`。
- Observation: migration は SQLx が起動時に自動実行し、本番DBには `_sqlx_migrations` の履歴がある。別 runner を安易に導入すると既存 migration を再実行する危険がある。
  Evidence: `bookshelf-api/src/main.rs` と `bookshelf-api/migrations/`。

## Decision Log

- Decision: frontend のルート構成は動かさず、`api/package.json` を持つ pnpm workspace package を追加する。
  Rationale: frontend の大量移動を避けながら依存、build、test の境界を明確にできる。frontend と API は本番でも独立プロセスとする。
  Date/Author: 2026-09-08 / Codex
- Decision: Node.js 24、TypeScript、GraphQL Yoga、`pg`、`jose`、Zod、Pino を使い、ORM は導入しない。
  Rationale: 現行は PostgreSQL 固有の lock、CTE、bulk SQL、複合外部キーに依存する。ORM移行を同時に行うとSQLの意味まで変わり、言語移植との差を切り分けにくい。Yoga は schema-first と GraphiQL を小さいHTTP層で提供できる。
  Date/Author: 2026-09-08 / Codex
- Decision: `schema.graphql` と SQL migration を先に無変更コピーし、Rust 版との schema diff と black-box differential test を設ける。
  Rationale: TypeScript の型だけでは nullability、scalar serialization、error extensions、transaction の副作用差を検出できない。
  Date/Author: 2026-09-08 / Codex
- Decision: read、単純 mutation、複合 mutation の順に縦切りで移植し、各段階で独立DB上の両実装を比較する。
  Rationale: Rust 版を常に参照実装とロールバック先に保ち、小さい単位で互換性を証明できる。
  Date/Author: 2026-09-08 / Codex
- Decision: migration runner は `_sqlx_migrations` の version、description、success、checksum、execution_time と SQLx の SHA-384 checksum に互換させる。
  Rationale: 空DBだけでなく SQLx 管理済みDBへ接続し、適用済みSQLの変更も拒否するため。spike で一致しなければ Node の自動 migration を止め、当面は Rust image の専用 migration job を使う。
  Date/Author: 2026-09-08 / Codex

## Outcomes & Retrospective

計画作成時点では実装成果はない。完了時に互換性試験の結果、性能差、切り替え日時、安定期間中の障害、Rust 版廃止の可否を記録する。

## Context and Orientation

`src/` は browser application、`src/graphql/` は frontend が送る GraphQL document、`codegen.yml` は schema から browser 用型を生成する設定である。`e2e-integration/` は実 API を使う Playwright suite で、テストごとに一意な Auth0 subject を使う。`scripts/integration-up.sh` と `docker-compose.integration.yml` は現在 GHCR の Rust API image を起動する。

新しい `api/` は独立 workspace package とする。`api/src/presentation/` は HTTP、GraphQL、認証、公開エラー、`api/src/application/` は use case と transaction、`api/src/domain/` は entity と validation、`api/src/infrastructure/postgres/` は SQL と row mapping を扱う。依存方向は presentation → application → domain とし、infrastructure は application の interface を実装する。resolver から `pg` を直接呼ばない。

コピーする契約の正本は `api/schema.graphql` と `api/migrations/*.sql` である。移植元の commit SHA を `api/PORTING_BASELINE.md` に記録する。単なるコピーと内容変更は別 commit にする。

route は Rust 版と同じ `GET /`、`GET /health`、`GET /me`、`POST /graphql`、`GET /graphql/playground` とする。JWT は RS256、issuer は `https://${JWT_DOMAIN}/`、audience は `JWT_AUDIENCE` とし、JWKS は一時間 cache する。未知 `kid` のときだけ一度再取得する。JWKS URL は HTTPS または loopback HTTP のみ許可する。

DB の current state は `bookshelf_user`、`book`、`author`、`book_author`、履歴は `operation`、revision、operation-change、revision-author table である。全て `user_id` で tenant 分離される。mutation は operation 作成、current state 更新、revision、change を一 transaction で行い、preview import は同じ経路を実行後 rollback する。

## Plan of Work

### Milestone 0: 契約を凍結して比較器を作る

`pnpm-workspace.yaml` に `api` を追加し、`api/PORTING_BASELINE.md` に Rust API の commit SHA、schema hash、migration hash、API version を記録する。schema、migration、必要な test fixture を無変更コピーする。

`contract-tests/` に HTTP black-box harness を作る。`REFERENCE_API_URL` と `CANDIDATE_API_URL` を受け、同じ migration の二つのDBとJWT fixtureで、HTTP status、JSON data、GraphQL error、DBの公開tableを比較する。生成 UUID と timestamp は symbolic ID へ正規化し、参照整合性と時刻順序を比較する。Rust 対 Rust で安定すること、意図的な不一致 fixture で field path を示して失敗することを受入条件とする。

### Milestone 1: API 骨格、認証、migration を作る

`api/package.json`、tsconfig、`api/src/main.ts`、config、HTTP server を追加する。全環境変数を起動時にZodで検証し、SIGTERMで server と pool を閉じる。CORS は設定 origin、GET/POST、Authorization/Accept/Content-Type に限定する。

認証層は token をログせず、認証なしを401 `Requires authentication`、無効tokenを既存401 JSON、JWKS障害を固定503 JSONにする。並行 cache miss を一Promiseに集約する。

 migration は transaction と advisory lock で二重適用を防ぐ。既存 fixture DB で SQLx checksum compatibility を先に証明する。一致時だけ起動時 migration を有効化し、不一致なら Decision Log を更新して専用 migration job に切り替える。空DB、SQLx適用済みDBでのno-op、改変SQL拒否、二プロセス同時起動、health、認証failure modeを受入試験とする。

### Milestone 2: 読み取り API を移植する

domain 型と repository interface を作り、user、book、author、history の read SQL を意味を保って移植する。全queryで認証 subjectを `user_id` predicateとjoin keyに含める。

GraphQL は schema-first resolver とし、Date、DateTime、JSON、Book の epoch integer timestamp を現状どおりserializeする。nested fieldはrequest-scoped DataLoaderでbatchし、tenant IDをkeyに含める。`loggedInUser`、book、author、operation、revision queryを一つずつ追加し、各commitにunit/integration/contract testを含める。read contract suiteとfrontendの一覧・詳細・履歴E2E一致を受入条件とする。

### Milestone 3: user と単一 entity mutation を移植する

`registerUser`、Book/Author の create、update、delete を順に実装する。`withOperationTransaction` が operation ID と user ID を一つの `pg.PoolClient` に束ね、command repository はこの context のみを受ける。

row lock、revision採番、operation detail、snapshot、change、author membership、constraint名による conflict 分類を一致させる。未知DB errorは conflictに推測しない。公開errorは `NOT_FOUND`、`VALIDATION_ERROR`、`CONFLICT`、`INTERNAL_ERROR` とし、内部詳細とuser IDを隠す。各statement後のfault injectionでpartial rowがないこと、cross-tenant書込不可、frontend CRUD E2E一致を受入条件とする。

### Milestone 4: 複合 mutation と履歴操作を移植する

`importBooks`、`previewBookImport`、`mergeAuthor`、`restoreBook`、`restoreAuthor`、`undoOperation` の順に実装する。bulk lock順を安定キーで統一する。preview は production import と同じfunctionを使ってrollbackする。

restoreは古いrevisionをcurrent identityにせずfresh revisionを追加し、Book restoreは全authorの同一tenant current stateを確認する。undoは全changeをlock後に再検証し、通常の `type = 'undo'` operationとして記録する。二重undo、対象の事後変更、削除済み復元、mergeの複数change、並行mutationを試験し、revision重複・履歴欠落がないことを受入条件とする。

### Milestone 5: リポジトリ統合とリリースを完成する

ルートに `api:dev`、`api:build`、`api:test`、`api:typecheck`、`api:lint`、`integration:up:node` scriptsを追加する。schema fetchは同一repoの `api/schema.graphql` を検証する。composeは `API_IMPLEMENTATION=rust|node` で両方を起動でき、既存Playwrightをmatrix実行する。

`api/Dockerfile` はmulti-stage、production dependencyのみ、non-root実行とする。CIはfrontend、API、migration、schema drift、Rust-vs-Node contract、Node image E2E、security checksを必須にする。releaseは一度buildしたimageにE2Eし、同じdigestだけpushする現行保証を維持する。README、env template、architecture、database、Renovate、versioningを更新する。clean checkoutから全test/buildと空DB・upgrade DB E2Eが成功することを受入条件とする。

### Milestone 6: 本番を段階的に切り替える

stagingの本番相当DB cloneでmigrationがno-opであること、row count、constraint、GraphQL smokeを確認する。本番はmigration job後にtrafficなしでNodeを起動し、healthとauthenticated canaryを通す。

Rust image、設定、DB backupを保持し、read、低リスクmutation、複合mutationの順にcanaryする。status、error code、latency、pool、deadlock、rollback、operation/change件数を監視する。異常時はroutingをRust imageへ戻し、Node固有の不可逆migrationがないためDB rollbackはしない。一リリース期間の安定後に `bookshelf-api.version` と外部Rust integration jobを削除し、Rust repoをarchiveする。

## Concrete Steps

実装開始時に feature branch とcleanlinessを確認する。

    git branch --show-current
    git --no-pager status --short

各 milestone で次を実行する。API script名は Milestone 1 と5で追加して以後固定する。

    pnpm install --frozen-lockfile
    pnpm run generate
    pnpm run lint
    pnpm run typecheck
    pnpm run test
    pnpm run api:test
    pnpm run api:test:integration
    pnpm run test:contract
    pnpm run test:integration:node
    pnpm run build
    pnpm run api:build

commit前は `AGENTS.md` の mandatory checks を実行し、API追加後はAPI test/typecheckもgateへ加える。各 milestone commitに更新済みExecPlanを含める。

最終比較は二つの一時DBと異なるportを使う。

    REFERENCE_API_URL=http://localhost:8080 CANDIDATE_API_URL=http://localhost:8081 pnpm run test:contract
    pnpm run integration:up:node
    pnpm run test:integration
    pnpm run integration:down

## Validation and Acceptance

GraphQL gateはschemaが意図した変更以外一致し、全operationが同じshape、nullability、enum、scalar、公開errorを返すこと。既存frontend documentsを全てcodegenできること。

DB gateは空DBとRust運用済みDB cloneでmigrationが成功し、適用済みSQLを再実行せず、全制約と履歴を保持すること。mutationごとにoperation一件、影響entityごとにchange、存在するafter stateごとにrevisionがあるというSQL invariant testを設ける。

security gateはJWT欠落・破損・期限切れ・issuer/audience/signature不一致・未知kid・非RSA鍵・JWKS timeout/4xx/5xx/invalid JSON・危険なHTTP URLを試験し、token、user ID、SQL、内部URLがresponse/logに漏れないこと。全repositoryにcross-tenant testを置く。

運用 gateはSIGTERM、DB切断、JWKS障害、二重migration、pool枯渇を試験し、health、終了、再起動が期待どおりで、Rustへの切り戻し rehearsalが成功すること。

性能は同一seedで books、authors、operation detail、100冊import、merge、undoのp50/p95とSQL query数を比較する。Node p95がRustの2倍または既存SLO超過、query数増加ならreleaseを止める。baselineと許容値はMilestone 0測定後に追記する。

## Idempotence and Recovery

migrationは一度だけ適用し、適用済みchecksum差を検出したら起動失敗する。既存migrationは編集せず新規SQLを追加する。testは専用DBまたは一意user subjectを使い再実行可能にする。

移植中はRust repo、release image、CIを維持する。Node本番接続前にDB backupと復元を確認する。障害時は直前のRust image digestへ戻す。移植目的の破壊的schema migrationは禁止し、必要なら別のexpand/migrate/contract計画に分離する。共有branchは `git revert` で戻しhistoryを書き換えない。cleanup scriptは既存volumeを削除しない。

## Artifacts and Notes

主な対応関係は次のとおり。

    bookshelf-api/src/presentation/*       -> api/src/presentation/*
    bookshelf-api/src/use_case/*           -> api/src/application/*
    bookshelf-api/src/domain/*             -> api/src/domain/*
    bookshelf-api/src/infrastructure/*     -> api/src/infrastructure/postgres/*
    bookshelf-api/schema.graphql           -> api/schema.graphql
    bookshelf-api/migrations/*             -> api/migrations/*
    bookshelf-api/e2e/tests/*               -> api/test/e2e/* and contract-tests/*

現時点のGraphQL surfaceはQuery 10件、Mutation 13件、HTTPは5 routeである。変化したらschemaから再集計する。

## Interfaces and Dependencies

`api/src/application/transaction.ts` は少なくとも次を公開する。

    type OperationContext = {
      client: PoolClient;
      userId: string;
      operationId: string;
      revisionNumber?: number;
    };

    interface TransactionManager {
      withOperation<T>(userId: string, operation: NewOperation,
        work: (context: OperationContext) => Promise<T>):
        Promise<{ value: T; operationId: string; revisionNumber?: number }>;
      preview<T>(userId: string, operation: NewOperation,
        work: (context: OperationContext) => Promise<T>): Promise<T>;
    }

command repositoryは `OperationContext` を受け、裸のPoolを受けない。query repositoryは第一引数にuserIdを要求する。NotFoundは内部user IDを保持できるがpresentation mapperは捨てる。DB error mapperはoperationとexact constraint名の組み合わせのみを `CONFLICT` にする。

GraphQL YogaはHTTP executionとGraphiQL、`graphql`はschema/parser、`pg`はPostgreSQL、`jose`はJWT/JWK、Zodは設定とinput validation、Pinoはstructured log、DataLoaderはnested batchingに使う。追加前にNode 24/ESM対応、license、保守状況を確認しlockfileへ固定する。

Revision note (2026-09-08): 初版。互換性優先の段階移植、SQLx migration compatibility spike、Rust/Node differential testing、canaryとrollbackを組み込んだ。
