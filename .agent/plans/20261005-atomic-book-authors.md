# Save books and new authors atomically

This living ExecPlan follows `.agent/PLANS.md`. Update Progress, discoveries, decisions and outcomes with each milestone.

## Purpose / Big Picture

Issue hiterm/bookshelf#404 concerns author creation partially succeeding before a book save. Add and edit must save the book, new authors, links and history together. On an author-name conflict, roll back everything, refresh authors in the browser, replace unchanged pending selections with exact-name existing authors, tell the user the book is not saved, and let them save again.

## Progress

- [x] (2026-10-05 JST) Inspect repositories and update from latest main; create codex/atomic-book-authors branches.
- [x] (2026-10-05 JST) Milestone 1: Implement backend contract and atomic persistence; verify unit and real database rollback tests.
  - [x] plan updated
- [x] (2026-10-05 JST) Milestone 2: Implement browser recovery, generated schema and mock contracts; verify UI and E2E behavior.
  - [x] plan updated
- [x] (2026-10-05 JST) Milestone 3: Complete required checks and publish mutually linked PRs referencing issue 404.
  - [x] plan updated

- [x] (2026-10-10 JST) API implementation merged by the user; release PR 372 passed all CI, was merged, and published 2.17.6.
- [x] (2026-10-10 JST) Milestone 4: Validate and deploy API 2.17.6, update frontend API pin, complete CodeRabbit review and frontend checks.
  - [x] plan updated
- [x] (2026-10-10 JST) Milestone 5a: Merge frontend PR 411; verify issue closure and prepare release PR 413 for v2.18.6.
  - [x] plan updated
- [ ] Milestone 5b: Merge release PR 413 after all checks and verify v2.18.6 publication and production deployment.

## Surprises & Discoveries

The repositories are symlinks outside the virtual workspace, so writes and Git operations need sandbox escalation. Existing import can reuse authors, but this feature must reject existing names. Use the ordinary author repository create method instead. Operation history already supports multiple entity changes and Undo.

## Decision Log

2026-10-05, user-approved: extend existing inputs with `newAuthorNames: [String!]! = []`; keep authorIds. Deduplicate exact names and IDs, use empty yomi for new authors and deterministic name insertion order. Keep strict conflict semantics in the API; recover only the browser selection after rollback. Do not automatically resubmit or guarantee idempotency after response loss. Use one CreateBook/UpdateBook operation and return the book revision. No database migration is required.

## Outcomes & Retrospective

Both implementations and local validation are complete. Frontend: 304 unit tests, typecheck, lint and formatting passed. Two Mock API recovery E2Es, one Demo Mode multi-author save E2E, and two real-API recovery E2Es passed. Backend: 179 unit tests, five real-DB tests, and 52 HTTP E2Es passed. PR publication is complete: API https://github.com/hiterm/bookshelf-api/pull/371 and frontend draft https://github.com/hiterm/bookshelf/pull/411 are mutually linked and reference issue 404. The frontend PR is draft until the backend release exists and bookshelf-api.version is updated to it. The user authorized continuing through frontend release on 2026-10-10 JST. API implementation PR 371 is merged, and API release PR 372 has published 2.17.6. The validated release image was published, and deployment PR 7 passed its smoke test and was merged. Its production Vercel deployment succeeded. Frontend PR 411 pins 2.17.6; all functional CI suites passed and CodeRabbit approved the pin correction. Six HTTP-level Demo Mode handler tests passed along with all required checks (310 unit tests). CI passed Mock API, Demo Mode, released-API and API-main integration suites. Codecov project passed at 69.91% (+1.29 points); patch coverage passed at 86.36%. PR 411 is merged as a836480, issue 404 is closed, and duplicate dependency update PR 412 is closed. The remaining release gate is PR 413 for v2.18.6 and its production deployment.

## Context and Orientation

In bookshelf-api, src/presentation/graphql/object.rs defines inputs, src/use_case/dto/book.rs carries them to src/use_case/interactor/book.rs, which owns transactions. AuthorRepository.create records author history in its caller's transaction. Domain, use-case and presentation errors must carry a typed author-name conflict to GraphQL extensions code CONFLICT and reason AUTHOR_NAME_CONFLICT. In bookshelf, src/features/books/AddBookButton.tsx and BookEdit.tsx currently create authors before saving. Replace that workflow with one book mutation. src/mocks/mockStore.ts and handlers.ts supply demo and test behavior and must enforce the same all-or-nothing contract.

## Plan of Work

Milestone 1 extends both book input DTOs and GraphQL inputs, validates ownership before writes, creates authors in the book transaction and preserves response metadata. Add typed error mapping and database tests proving rollback after an earlier author insert and after book persistence failure. Check duplicate input, concurrent conflict, tenant separation, old clients, history and Undo. Run the backend checks below and update this plan before committing.

Milestone 2 generates the frontend schema/types from the modified backend using GRAPHQL_SCHEMA_PATH, splits selected authors into existing IDs and new names, and removes resolvePendingAuthors. A shared recovery hook fetches fresh authors on the typed conflict, matches exact names only against unchanged submitted pending selections, deduplicates resolved IDs, and notifies without saving. Hold the submission guard until recovery finishes. Preserve edits/removals made during the request. Failed refresh or no match keeps input and reports an error. Invalidate author and book caches on success. Update demo/mock behavior and component/E2E regressions, then update this plan before committing.

Milestone 3 runs all required checks, documents the new contract, and publishes two PRs. API body contains `Refs hiterm/bookshelf#404`, frontend body `Closes #404`; cross-link both and state API-first release dependency. Attach both PRs to this chat. The frontend PR must not merge before its schema dependency is available.

## Concrete Steps

From bookshelf-api run `cargo fmt --check`, `cargo clippy --all-targets --locked -- -D warnings`, `cargo test --locked`, and `cargo run --bin gen_schema`. Database tests require a local PostgreSQL DATABASE_URL with permission to create test databases. Use README.md's JWT/JWKS server setup for `cargo test -p bookshelf-e2e -- --test-threads=1`.

From bookshelf run `GRAPHQL_SCHEMA_PATH=../bookshelf-api/schema.graphql pnpm run generate`, `pnpm run lint:fix`, `pnpm run format`, `pnpm run test`, `pnpm run typecheck`. Run relevant `pnpm run test:e2e:mock-api`, `pnpm run test:e2e:demo-mode`, and `pnpm run test:e2e:integration` suites with local resource overrides if needed. Do not change shared concurrency configuration. Record exact successful commands and counts below.

## Validation and Acceptance

An API request with new authors A and B, where B already exists, returns the typed conflict and leaves no A, book mutation or failed-operation history. A subsequent browser refresh replaces B's unchanged pending selection with its real ID and reports that the book remains unsaved. Clicking save creates A and saves the book once. Test this for create and update. A book write failure after author insertion leaves no new author. One operation contains all successful changes, and immediate Undo reverts them. Invalid/cross-user IDs fail; another user's same author name does not conflict. Concurrent same-user names cannot both be created. Old clients omitting newAuthorNames still work.

## Idempotence and Recovery

No migration or destructive data cleanup is needed. Test users/databases are isolated. Keep input after errors and do not automatically retry writes. A committed response lost in transit is outside this feature's guarantee. Preserve user changes and retry failed tooling only after diagnosing the cause.

## Artifacts and Notes

Initial main revisions: frontend fdd6784; API 232ae40. Verification commands: GRAPHQL_SCHEMA_PATH=../bookshelf-api/schema.graphql pnpm run generate; pnpm run lint:fix; pnpm run format; pnpm run test --maxWorkers=2; pnpm run typecheck. E2E commands: pnpm exec playwright test e2e-mock-api/atomic-books.spec.ts --workers=1 (2 passed); pnpm exec playwright test --config=playwright.demo.config.ts e2e-demo-mode/atomic-books.spec.ts --workers=1 (1 passed); pnpm exec playwright test --config=playwright.integration.config.ts e2e-integration/atomic-books.spec.ts --workers=1 (2 passed). Earlier full Mock API suite had 59 passes and one navigation failure; the navigation fix then passed the focused recovery suite. PR URLs: API https://github.com/hiterm/bookshelf-api/pull/371; frontend draft https://github.com/hiterm/bookshelf/pull/411. API uses Refs hiterm/bookshelf#404; frontend uses Closes #404. Native attach_artifact was attempted for both but the host reports that tool unavailable; provide both links in the chat.

## Interfaces and Dependencies

Use existing Rust transaction/repository traits and React Query hooks; add no dependencies. CreateBookInput and UpdateBookInput gain newAuthorNames with an empty default; corresponding Rust DTOs gain Vec<String>. GraphQL author-name conflicts have code CONFLICT and reason AUTHOR_NAME_CONFLICT. Recovery changes form references only, never stored author attributes. Backend deploy precedes the frontend; local type generation uses GRAPHQL_SCHEMA_PATH until the backend release exists.

Revision note: initialized from the approved design on 2026-10-05.

Revision note: completed frontend recovery and verification milestones on 2026-10-05. Keep vmThreads and limit worker count locally; a forks experiment exposed Mantine teardown differences. Tests now provide their own matchMedia stub. The mock edit E2E uses SPA links so Auth0 state survives navigation.

Revision note: published and cross-linked both issue-associated PRs on 2026-10-05. Local implementation and validation are complete; backend release and frontend version-pin update remain the documented merge gate.

Revision note: resumed rollout on 2026-10-10 JST under explicit user authorization. API release PR https://github.com/hiterm/bookshelf-api/pull/372 passed all checks and published 2.17.6. The frontend now pins that actual release. Local Mock API E2E passed all 60 tests and Demo Mode E2E passed all 18 tests with the new schema. Requested a fresh full CodeRabbit review; no CI workaround is retained.

Revision note: API 2.17.6 is deployed successfully via https://github.com/hiterm/bookshelf-api-deploy/pull/7 (merge ba1b351). CodeRabbit requested only the released API pin; that thread is resolved and review approved. All frontend functional CI passed on ce11c10. Codecov project is 68.35% versus 68.61% baseline; newly changed Demo Mode HTTP handlers were untested at the transport boundary. Add six handler tests covering create/update success, legacy inputs, typed conflicts with full rollback and invalid new-author values, then repeat required checks.

Revision note: on 2026-10-10 JST all frontend CI and Codecov checks passed on a284918; CodeRabbit approved after the dependency correction. PR 411 merged, closing issue 404. API 2.17.6 is already deployed. Release PR https://github.com/hiterm/bookshelf/pull/413 contains the frontend v2.18.6 version and changelog; this documentation update records rollout progress before its final merge. Confirm the release workflow and both production frontend deployments after merging.
