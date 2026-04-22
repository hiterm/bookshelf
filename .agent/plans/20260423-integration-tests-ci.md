# Add CI Integration Tests Against Real bookshelf-api

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. Maintain this document in accordance with `.agent/PLANS.md`.


## Purpose / Big Picture

Currently all tests in this repository (unit tests, Playwright e2e tests) run against mocked data. The Playwright e2e tests mock both the Auth0 endpoints and the GraphQL API endpoint at the Playwright network level, so they never exercise the real bookshelf-api server.

After this change, a new CI job called `test-integration` will check out the real `bookshelf-api` at the version recorded in `bookshelf-api.version`, start it alongside a PostgreSQL database and a JWKS mock server, then run Playwright tests that talk to the real API. This verifies that the frontend's GraphQL operations are compatible with the actual server — a class of breakage the existing tests cannot catch.

To see it working: open a pull request and observe the `test-integration` job succeeding in GitHub Actions alongside the existing `test`, `test-e2e`, and `test-e2e-demo` jobs.


## Progress

- [ ] Milestone 1 — Copy bookshelf-api test private key and write integration test fixtures
- [ ] Milestone 2 — Write integration test specs (books.spec.ts, auth.spec.ts)
- [ ] Milestone 3 — Add playwright.integration.config.ts and package.json script
- [ ] Milestone 4 — Add test-integration CI job to .github/workflows/ci.yml
- [ ] Milestone 5 — Validate locally (manual run) and verify CI passes


## Surprises & Discoveries

(none yet)


## Decision Log

- Decision: Use the pre-published Docker image `ghcr.io/hiterm/bookshelf-api` from GHCR instead of building from source.
  Rationale: Building Rust from source in CI is slow (5–10 min even with cache). bookshelf-api already publishes versioned images to GHCR at `ghcr.io/hiterm/bookshelf-api`. Using the image eliminates the Rust toolchain, `Swatinem/rust-cache`, `cargo install sqlx-cli`, and all `cargo run` steps from this repository's CI, resulting in a much faster job. The image tag is derived from `bookshelf-api.version` (e.g., `v2.4.0`); verify the exact tag format against https://github.com/hiterm/bookshelf-api/pkgs/container/bookshelf-api before implementation.
  Date/Author: 2026-04-23 / Claude (revised 2026-04-23)

- Decision: Replace the `bookshelf-jwks-server` cargo binary with a minimal Node.js HTTP server (`e2e-integration/jwks-server.mjs`).
  Rationale: `bookshelf-jwks-server` is a Rust binary that simply serves a static JSON file on port 9999. A ~15-line Node.js ESM script using `node:http` and `node:fs` does the same thing with zero build time. The JWKS JSON (`testdata/test_jwks.json`) is copied into `e2e-integration/test_jwks.json` alongside the PEM file so the fixture is self-contained.
  Date/Author: 2026-04-23 / Claude

- Decision: Use `docker run postgres:15` for PostgreSQL instead of the system PostgreSQL on ubuntu-latest.
  Rationale: The ubuntu-latest runner ships a different PostgreSQL version than production. Pinning to `postgres:15` matches the bookshelf-api production environment and avoids version-skew bugs. Using `--network host` lets the container listen on `localhost:5432`, so the DATABASE_URL and `psql` commands on the host are unchanged. The bookshelf-api container also uses `--network host`, so it can reach both `localhost:5432` (Postgres) and `localhost:9999` (JWKS server) without a custom Docker network.
  Date/Author: 2026-04-23 / Claude

- Decision: Run database migrations with `psql` directly instead of `sqlx-cli`.
  Rationale: `sqlx-cli` requires either a Rust toolchain (`cargo install`) or a separately managed pre-built binary. Because bookshelf-api currently has a single migration file, running it with `psql -f` achieves the same schema setup without any extra tooling. If additional migration files are added in the future, re-evaluate whether sqlx-cli tracking is needed.
  Date/Author: 2026-04-23 / Claude

- Decision: Copy bookshelf-api's test private key PEM into this repository at `e2e-integration/integrationTestPrivateKey.pem`.
  Rationale: The test private key is not a secret — it is committed to the public bookshelf-api repository. Copying it into this repo makes the integration test fixtures self-contained without needing env var path gymnastics. Keeping it in sync is simple: update the file whenever `bookshelf-api.version` is bumped and the test key changes.
  Date/Author: 2026-04-23 / Claude

- Decision: Use a unique random UUID as the JWT `sub` (user ID) for each test.
  Rationale: bookshelf-api scopes all data (books, authors) to the authenticated user. Using a new UUID per test means each test works against its own isolated user row in PostgreSQL, so tests do not interfere with each other and no `TRUNCATE` or restart is needed between tests. This mirrors how bookshelf-api's own e2e tests work (see `e2e/src/lib.rs`: `uuid::Uuid::new_v4().to_string()`).
  Date/Author: 2026-04-23 / Claude

- Decision: Run integration tests with `fullyParallel: false` and `workers: 1`.
  Rationale: While UUID-based isolation avoids data conflicts, starting multiple browser contexts that each register a new user and issue concurrent writes against a single SQLite/Postgres server can cause flakiness in CI. Serial execution is safer as a starting point; parallelism can be re-enabled later once the suite is proven stable.
  Date/Author: 2026-04-23 / Claude


## Outcomes & Retrospective

(to be filled in after completion)


## Context and Orientation

### Repository layout

This is a React/TypeScript frontend (Vite, TanStack Router, Mantine, graphql-request) that communicates with bookshelf-api over a single GraphQL endpoint. The two key files controlling API connectivity are:

- `src/config.ts` — reads `VITE_BOOKSHELF_API` (set at build time) as the GraphQL URL.
- `src/lib/graphqlClient.ts` — creates a `graphql-request` client with a Bearer token header sourced from Auth0.

### Existing test infrastructure

The existing Playwright e2e tests live in `e2e/` and use `playwright.config.ts`. The key files are:

- `e2e/fixtures.ts` — a custom Playwright test fixture that intercepts Auth0 network requests (authorize, token, JWKS, logout) and the GraphQL endpoint (`http://localhost:4000/graphql`), fulfilling them all from an in-memory mock store.
- `e2e/testKeys.ts` — an RSA private key in JWK format used exclusively by the e2e fixture to sign `id_token` JWTs for the Auth0 SDK.
- `e2e/testConstants.ts` — `TEST_AUTH0_DOMAIN = "test.auth0.hiterm.dev"`, `TEST_AUTH0_CLIENT_ID = "test-client-id"`.
- `e2e/mockStore.ts` — an in-memory store seeded with two authors and four books.

The `id_token` is what the Auth0 browser SDK validates client-side (using the JWKS endpoint of the configured Auth0 domain). The `access_token` is what the frontend attaches as a Bearer header to every GraphQL request; bookshelf-api validates this JWT.

In the existing fixtures the `access_token` value is the plain string `"mock-access-token"`, which a real bookshelf-api would reject.

### bookshelf-api facts (version 2.4.0)

bookshelf-api (at `/home/hiterm/ghq/github.com/hiterm/bookshelf-api`, also publicly at `https://github.com/hiterm/bookshelf-api`) is a Rust/Actix-web GraphQL API backed by PostgreSQL.

Relevant environment variables:

    DATABASE_URL   postgres connection string
    PORT           listening port (default 8080)
    JWT_AUDIENCE   audience claim expected in Bearer tokens (use "test-audience")
    JWT_DOMAIN     Auth server domain; JWKS URL defaults to https://<JWT_DOMAIN>/.well-known/jwks.json
    JWKS_URL       optional override; HTTP is allowed only for loopback addresses

bookshelf-api includes a ready-made JWKS test server binary:

    cargo run --locked -p bookshelf-e2e --bin bookshelf-jwks-server

It listens on port 9999 by default (override with `JWKS_SERVER_PORT`) and serves `testdata/test_jwks.json`, which contains the public key for `test-key-id`. The matching private key is `testdata/test_private_key.pem` (PKCS8 PEM, RSA-2048, already public in the repo).

The token that bookshelf-api accepts must have:

    alg: RS256
    kid: "test-key-id"
    iss: "https://test-issuer.local/"
    aud: "test-audience"
    sub: <any string — used as the bookshelf user ID>

bookshelf-api's own e2e CI workflow (`.github/workflows/e2e.yml`) shows the full startup recipe:

1. Start PostgreSQL via `sudo systemctl start postgresql.service`.
2. Create user/DB: `sudo -u postgres psql --command="CREATE USER bookshelf WITH SUPERUSER PASSWORD 'password'" ... && sudo -u postgres createdb --owner=bookshelf bookshelf`
3. Install sqlx-cli: `cargo install sqlx-cli --locked --no-default-features --features postgres,rustls`
4. Run migrations: `DATABASE_URL=... sqlx database create && sqlx migrate run`
5. Start JWKS server (background).
6. Start bookshelf-api with `JWKS_URL=http://localhost:9999/.well-known/jwks.json`, `JWT_AUDIENCE=test-audience`, `JWT_DOMAIN=test-issuer.local`.
7. Poll `/health` until ready.
8. Run tests with `TEST_SERVER_URL=http://localhost:8080`.

The bookshelf-api e2e CI uses `Swatinem/rust-cache` (commit `c19371144df3bb44fab255c43d04cbc2ab54d1c4`) for build caching. We reuse the same approach.

### bookshelf-api GraphQL endpoint

The GraphQL endpoint on bookshelf-api is at `POST /graphql`. The schema used by the frontend is fetched from `https://raw.githubusercontent.com/hiterm/bookshelf-api/${VERSION}/schema.graphql` and stored at `src/graphql/schema.graphql`. When the frontend runs, every GraphQL request carries the access_token in the `Authorization: Bearer <token>` header.

### bookshelf-api data model (high level)

All data belongs to a user identified by the JWT `sub` claim. On first login the frontend must call the `registerUser` mutation (which creates the user row). Subsequent GraphQL queries/mutations are scoped to that user's ID. Because integration tests each generate a new UUID as `sub`, every test run creates a fresh user with no data — providing natural isolation.


## Plan of Work

### Milestone 1 — Integration test fixtures

**Create `e2e-integration/integrationTestPrivateKey.pem`**

Copy the content of `/home/hiterm/ghq/github.com/hiterm/bookshelf-api/testdata/test_private_key.pem` verbatim. This key is test-only and already public.

**Create `e2e-integration/test_jwks.json`**

Copy the content of `/home/hiterm/ghq/github.com/hiterm/bookshelf-api/testdata/test_jwks.json` verbatim. This is the JWKS document served by the local JWKS mock server so bookshelf-api can validate the `access_token`.

**Create `e2e-integration/jwks-server.mjs`**

A minimal Node.js ESM HTTP server that serves `test_jwks.json` on `http://localhost:9999/.well-known/jwks.json`. Example:

```js
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const jwks = fs.readFileSync(path.join(dir, 'test_jwks.json'), 'utf-8');

const port = process.env.JWKS_SERVER_PORT ?? 9999;
http.createServer((req, res) => {
  if (req.url === '/.well-known/jwks.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(jwks);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port, () => console.log(`JWKS server listening on :${port}`));
```

**Create `e2e-integration/fixtures.ts`**

This file is structurally similar to `e2e/fixtures.ts` with three differences:

1. The token endpoint mock generates a real signed `access_token` (JWT) using the integration test private key and the bookshelf-api token requirements. Use `importPKCS8` from `jose` to load the PEM, then `SignJWT` to produce the token.

2. The user ID (`sub`) is a freshly generated `crypto.randomUUID()` shared across all mocked Auth0 responses within a single test. A new UUID is generated once per `page` fixture setup so that each test file invocation gets its own isolated user.

3. There is no GraphQL route interception. The `page.route("http://localhost:8080/graphql", ...)` call from `e2e/fixtures.ts` is absent — all GraphQL traffic goes to the real server.

The Auth0 mocks (authorize, token, JWKS, logout) work the same way as `e2e/fixtures.ts`. The JWKS mock on `https://${TEST_AUTH0_DOMAIN}/.well-known/jwks.json` still returns the existing `TEST_PRIVATE_KEY_JWK` public key (for `id_token` validation by the Auth0 browser SDK). The `id_token` is still built using `TEST_PRIVATE_KEY_JWK` and `buildIdToken` (copied from `e2e/fixtures.ts`).

The `access_token` is built with:

    kid: "test-key-id"
    alg: RS256
    sub: <generated userId>
    aud: "test-audience"
    iss: "https://test-issuer.local/"
    exp: now + 86400

The `id_token` sub should also be the same `userId` so the frontend sees a consistent user identity.

The fixture does not export `MockStore` or `isNewUser`. Because the database starts empty, every test effectively starts as a new user. The `isNewUser` distinction from the existing e2e suite is not needed.

### Milestone 2 — Integration test specs

**Create `e2e-integration/auth.spec.ts`**

Test the new-user registration flow:

- Navigate to `/books`, click Login.
- Expect "Register user" button to appear (because the user does not exist in the DB yet).
- Click "Register user".
- Expect the books page to load (empty list — no books yet).
- Expect the nav links "本" and "著者" to be visible.

**Create `e2e-integration/books.spec.ts`**

Each test starts by logging in and registering the user (since every test has a fresh UUID), then exercises CRUD:

- Creates an author first (needed for book creation).
- Creates a book via the "本を追加" form.
- Verifies the book appears in the list.
- Navigates to the book detail page.
- Updates the book.
- Deletes the book and verifies it is gone.

The test should not rely on any pre-existing data. Because the database is empty on first access for a new UUID, every test is self-contained.

Use `test.describe.serial` to enforce serial execution within each file.

### Milestone 3 — Playwright config and npm script

**Create `playwright.integration.config.ts`**

Mirror the shape of `playwright.config.ts` but:

- `testDir`: `"./e2e-integration"`
- `fullyParallel`: `false`
- `workers`: `1`
- `webServer.env`:
  - `VITE_AUTH0_DOMAIN`: `TEST_AUTH0_DOMAIN` (same as existing e2e)
  - `VITE_AUTH0_CLIENT_ID`: `TEST_AUTH0_CLIENT_ID` (same)
  - `VITE_AUTH0_AUDIENCE`: `"test-audience"` (matches `JWT_AUDIENCE` in bookshelf-api)
  - `VITE_BOOKSHELF_API`: `"http://localhost:8080/graphql"` (real server)
  - `VITE_DEMO_MODE`: `"false"`
- `webServer.reuseExistingServer`: `false` (integration CI must always build fresh)

**Edit `package.json`**

Add to `scripts`:

    "test:integration": "playwright test --config=playwright.integration.config.ts"

### Milestone 4 — CI job

**Edit `.github/workflows/ci.yml`**

Add a new job `test-integration` after the existing jobs. The job must:

1. Check out this repository.
2. Set up Node 24 (same as other jobs).
3. Run `npm ci` and `npm run generate`.
4. Read the bookshelf-api version and derive the Docker image tag:

        - id: api-version
          run: echo "version=$(cat bookshelf-api.version | tr -d '[:space:]')" >> $GITHUB_OUTPUT

   The Docker image is `ghcr.io/hiterm/bookshelf-api:v${{ steps.api-version.outputs.version }}`.
   Verify the exact tag format against https://github.com/hiterm/bookshelf-api/pkgs/container/bookshelf-api
   before implementation (the tag may use `v` prefix or not).

5. Start PostgreSQL 15 via Docker and wait until ready:

        - run: |
            docker run -d \
              --name postgres \
              --network host \
              -e POSTGRES_USER=bookshelf \
              -e POSTGRES_PASSWORD=password \
              -e POSTGRES_DB=bookshelf \
              postgres:15
            for _ in {1..30}; do
              if docker exec postgres pg_isready -U bookshelf; then
                echo "PostgreSQL ready"; exit 0
              fi
              sleep 1
            done
            docker logs postgres; exit 1

6. Checkout bookshelf-api at the pinned version (for migration SQL files only — no build):

        - uses: actions/checkout@<pin>
          with:
            repository: hiterm/bookshelf-api
            ref: v${{ steps.api-version.outputs.version }}
            path: bookshelf-api

7. Run migrations via `docker exec psql` (no sqlx-cli, no Rust required):

        - run: |
            for f in bookshelf-api/migrations/*.sql; do
              docker exec -i postgres psql -U bookshelf -d bookshelf < "$f"
            done

8. Start the Node.js JWKS server (background) and wait for it to be ready:

        - run: |
            node e2e-integration/jwks-server.mjs > /tmp/jwks.log 2>&1 &
            for _ in {1..30}; do
              if curl -fs http://localhost:9999/.well-known/jwks.json > /dev/null; then
                echo "JWKS server ready"; exit 0
              fi
              sleep 1
            done
            cat /tmp/jwks.log; exit 1

9. Pull and start the bookshelf-api Docker image (background), then poll `/health`:

        - run: |
            docker run --rm -d \
              --name bookshelf-api \
              --network host \
              -e DATABASE_URL=postgres://bookshelf:password@localhost:5432/bookshelf \
              -e PORT=8080 \
              -e ALLOWED_ORIGINS=http://localhost:4173 \
              -e JWT_AUDIENCE=test-audience \
              -e JWT_DOMAIN=test-issuer.local \
              -e JWKS_URL=http://localhost:9999/.well-known/jwks.json \
              ghcr.io/hiterm/bookshelf-api:v${{ steps.api-version.outputs.version }}
            for _ in {1..60}; do
              if curl -fs http://localhost:8080/health > /dev/null; then
                echo "API ready"; exit 0
              fi
              sleep 1
            done
            docker logs bookshelf-api; exit 1

   Note: `--network host` allows the container to reach the PostgreSQL and JWKS server running
   on the host. Verify that the bookshelf-api image exposes a `/health` endpoint.

10. Install Playwright Chromium and run integration tests:

        - run: npx playwright install --with-deps chromium
        - run: npm run test:integration


## Concrete Steps

All commands are run from the repository root (`/home/hiterm/ghq/github.com/hiterm/bookshelf`) unless stated otherwise.

**Step 1 — Create feature branch**

    git checkout -b feat/integration-tests-ci

**Step 2 — Copy integration test private key**

    cp /home/hiterm/ghq/github.com/hiterm/bookshelf-api/testdata/test_private_key.pem \
       e2e-integration/integrationTestPrivateKey.pem
    cp /home/hiterm/ghq/github.com/hiterm/bookshelf-api/testdata/test_jwks.json \
       e2e-integration/test_jwks.json

**Step 2b — Write e2e-integration/jwks-server.mjs** (see Plan of Work — Milestone 1 above for full spec)

**Step 3 — Write e2e-integration/fixtures.ts** (see Plan of Work above for full spec)

**Step 4 — Write e2e-integration/auth.spec.ts and e2e-integration/books.spec.ts**

**Step 5 — Write playwright.integration.config.ts**

**Step 6 — Edit package.json** to add `"test:integration"` script

**Step 7 — Edit .github/workflows/ci.yml** to add `test-integration` job

**Step 8 — Pre-commit checks**

    npm run generate
    npm run test
    npm run typecheck
    npm run lint

**Step 9 — Commit and push**

    git add e2e-integration/ playwright.integration.config.ts package.json .github/workflows/ci.yml
    git commit -m "Add integration tests against real bookshelf-api"
    git push -u origin feat/integration-tests-ci

**Step 10 — Open PR and observe CI**

The `test-integration` job should pass alongside the other jobs. Inspect the Actions log to confirm the JWKS server started, the API became healthy, and the Playwright tests ran to completion.


## Validation and Acceptance

Run `npm run test:integration` locally with a running bookshelf-api instance. Prerequisites for local validation:

1. Start PostgreSQL 15 via Docker: `docker run -d --network host -e POSTGRES_USER=bookshelf -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bookshelf postgres:15`
2. Run migrations: `for f in /path/to/bookshelf-api/migrations/*.sql; do docker exec -i postgres psql -U bookshelf -d bookshelf < "$f"; done`
3. Start the JWKS server: `node e2e-integration/jwks-server.mjs &`
4. Start bookshelf-api via Docker:
   ```
   docker run --rm -d --network host \
     -e DATABASE_URL=postgres://bookshelf:password@localhost:5432/bookshelf \
     -e PORT=8080 -e JWT_AUDIENCE=test-audience -e JWT_DOMAIN=test-issuer.local \
     -e JWKS_URL=http://localhost:9999/.well-known/jwks.json \
     ghcr.io/hiterm/bookshelf-api:v2.4.0
   ```
5. From the frontend repo root: `npm run test:integration`

Expected outcome: all tests in `e2e-integration/` pass. The tests that should exist and pass are:

- `auth.spec.ts > registers new user and shows books page` — confirms registerUser mutation works against real API.
- `books.spec.ts > creates, displays, updates, and deletes a book` — confirms full book CRUD against real API.

In CI, acceptance is the `test-integration` job showing green in GitHub Actions.


## Idempotence and Recovery

Re-running the CI job is safe. Docker pulls are idempotent; the image is pulled by tag and cached by the runner. If the API fails to start within the polling loop, the step exits non-zero and runs `docker logs bookshelf-api` to dump the container log for diagnosis.

The PostgreSQL `CREATE USER` step will fail if the user already exists, but on `ubuntu-latest` runners each job starts with a clean OS image, so this is never a problem in CI.


## Artifacts and Notes

**Token structure summary:**

    id_token (for Auth0 browser SDK):
      alg: RS256, kid: "test-key-1"
      iss: "https://test.auth0.hiterm.dev/"
      aud: "test-client-id"
      sub: <userId>   ← same UUID used in access_token
      signed with: TEST_PRIVATE_KEY_JWK (e2e/testKeys.ts)

    access_token (Bearer token sent to bookshelf-api):
      alg: RS256, kid: "test-key-id"
      iss: "https://test-issuer.local/"
      aud: "test-audience"
      sub: <userId>   ← same UUID used in id_token
      signed with: e2e-integration/integrationTestPrivateKey.pem

**Node.js JWKS server** (`e2e-integration/jwks-server.mjs`) serves `e2e-integration/test_jwks.json` (the public key for `test-key-id`) on port 9999. bookshelf-api validates the `access_token` against this.

**Auth0 JWKS mock** (Playwright route) returns `TEST_PRIVATE_KEY_JWK` public fields. Auth0 browser SDK validates the `id_token` against this.


## Interfaces and Dependencies

No new npm dependencies are required. The `jose` library (already installed, used in `e2e/fixtures.ts`) supports `importPKCS8` for loading PKCS8 PEM private keys and `SignJWT` for producing tokens.

New files created by this plan:

    e2e-integration/integrationTestPrivateKey.pem  — RSA test private key (PKCS8 PEM, test-only)
    e2e-integration/test_jwks.json                 — JWKS document for the test key (served by jwks-server.mjs)
    e2e-integration/jwks-server.mjs                — Minimal Node.js JWKS HTTP server (port 9999)
    e2e-integration/fixtures.ts                    — Playwright fixtures for integration tests
    e2e-integration/auth.spec.ts                   — Auth/registration integration spec
    e2e-integration/books.spec.ts                  — Book CRUD integration spec
    playwright.integration.config.ts               — Playwright config pointing to real API

Modified files:

    package.json                       — add "test:integration" script
    .github/workflows/ci.yml           — add "test-integration" job
