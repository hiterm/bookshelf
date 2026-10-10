# Mutation cache dependencies

Audit baseline: main `63b9865` (2026-10-10), Issue #406 item 2. PR #402 already
refreshes book-update associations/revisions and merge dependencies. PR #411
already refreshes authors after atomic book saves. The changes below preserve
those contracts and close the remaining active-consumer gaps.

## Query keys and response dependencies

| Factory / key                                   | Response dependency                                               |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `bookQueryKeys.all` / `["books"]`               | Books with live author name/yomi                                  |
| `bookQueryKeys.detail(id)` / `["book", id]`     | Book with live author name/yomi                                   |
| `bookQueryKeys.revisions(id)`                   | Historical book snapshots with author IDs                         |
| `authorQueryKeys.all` / `["authors"]`           | Author directory, including authors created by book save/import   |
| `authorQueryKeys.detail(id)` / `["author", id]` | Live author and authored books (title, ISBN, format, read, owned) |
| `authorQueryKeys.revisions(id)`                 | Historical author snapshots                                       |
| `historyQueryKeys.all` / `["operations"]`       | Append-only operation list                                        |
| `historyQueryKeys.detail(id)`                   | Immutable operation and before/after revision snapshots           |

`details`, `allRevisions` address the respective detail/revision families, not
all application caches. Revision keys are `["bookRevisions", id]` and
`["authorRevisions", id]`; operation detail is `["operation", id]`.

## Successful-write invalidation matrix

Each cell names a query factory entry. A dash means no invalidation. `id` is the
mutation's input ID. All writes refresh `historyQueryKeys.all`; existing
operation details are retained.

| Mutation hook          | Books list | Book detail  | Book revisions  | Authors list | Author detail      | Author revisions |
| ---------------------- | ---------- | ------------ | --------------- | ------------ | ------------------ | ---------------- |
| `useCreateBook`        | `all`      | —            | —               | `all`        | `details`          | —                |
| `useUpdateBook`        | `all`      | `detail(id)` | `revisions(id)` | `all`        | `details`          | —                |
| `useDeleteBook`        | `all`      | `detail(id)` | —               | —            | `details`          | —                |
| `useImportBooks`       | `all`      | —            | —               | `all`        | `details`          | —                |
| `useCreateAuthor`      | —          | —            | —               | `all`        | —                  | —                |
| `useUpdateAuthor`      | `all`      | `details`    | —               | `all`        | `detail(id)`       | `revisions(id)`  |
| `useDeleteAuthor`      | `all`      | `details`    | —               | `all`        | `detail(id)`       | —                |
| `useMergeAuthor`       | `all`      | `details`    | `allRevisions`  | `all`        | source/destination | `allRevisions`   |
| `usePreviewBookImport` | —          | —            | —               | —            | —                  | —                |

Author rename changes embedded live names/yomi but does not rewrite book
revision snapshots. Book deletion changes author-detail book associations but
keeps revision snapshots. Import adds books/authors and leaves existing book
records unchanged. Author deletion retains its pre-existing book invalidation
policy; the real API rejects deletion of an author with associated books.
Merge retains the pre-existing revision-family refresh contract from #402.

Book update can affect both previous and new author associations. Delete and
import responses do not enumerate all affected author IDs. Refresh author
**detail families** rather than deriving incomplete dependencies from whatever
happens to be cached. Author update refreshes book detail families because its
response does not enumerate related book IDs. No cache is cleared or removed.

## Ownership, timing and failures

`src/features/books/api/invalidation.ts` and
`src/features/authors/api/invalidation.ts` contain explicit mutation functions;
`src/features/history/api/invalidation.ts` owns operations-list refresh. Hooks
call them only from `onSuccess`, using each feature's query-key factory. Shared
book-save targets cover creation, update and import; update additionally targets
its book detail and revisions. This is domain code, not a generic CRUD layer.

Invalidation keeps the existing lifecycle: refetches are scheduled without
awaiting them in `onSuccess`. Active subscribers fetch immediately; inactive
entries become stale for their next use. `mutateAsync` success means the write
succeeded, not that every refetch finished. Refetch failure retains cached data
and remains subject to the existing query error/retry behavior.

Mutation rejection does not invalidate/remove data or report success. A later
explicit retry may succeed. Atomic saves continue to use the conflict recovery
contract in [atomic-book-save.md](atomic-book-save.md). Transport response loss,
server idempotency and import transaction semantics remain API responsibilities;
these cache tests do not prove server rollback.

## Regression evidence and limits

`src/features/books/api/mutationCache.test.tsx` uses fresh real QueryClients and
real query/mutation hooks, controlling only token/SDK communication. Observers
stay mounted, with infinite stale time and mount/focus/reconnect refetch disabled.
Immutable server snapshots prevent shared-object mutation from mimicking refresh.
Assertions observe response data after awaited mutations, not invalidation mocks.

The expanded suite reproduced stale author names/revisions, deleted authored
books, imported authors/associations and operations before corrections. Rename
and import explicitly reject once, retain cached data/history and successfully
retry. Existing merge and failed book-update tests now also observe operations.
One sequential history test checks remaining create/delete writes without adding
mechanical tests for every hook. Existing operation details are simultaneously
subscribed and their one request verifies they are not unnecessarily invalidated.

The matrix covers existing domain query hooks. It does not subscribe to every
possible future ID before creation, implement push updates across clients, or
change API operations/authentication, automatic-refetch settings or test runtime
configuration. Add new dependencies here and protect observable consumers when
new queries or mutations are introduced.

## Validation (2026-10-10)

| Check                                      | Result                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Generation                                 | Pinned-schema generation passed; schema/SDK/types/route tree/MSW hashes unchanged on regeneration |
| Lint / format / typecheck / combined check | Passed; all four TypeScript projects                                                              |
| Focused active-cache suite                 | 6 passed, including 4 new cases                                                                   |
| Full Vitest / coverage                     | 52 files / 314 tests passed; Lines 79.73%, Branches 59.49%                                        |
| Production build                           | Passed (existing chunk-size warning)                                                              |
| Mock API E2E                               | Final standalone full run: 60 passed                                                              |
| Demo E2E                                   | 18 passed                                                                                         |
| Real API E2E: pinned 2.17.6                | 14 passed                                                                                         |
| Real API E2E: main                         | 14 passed; image digest `sha256:75028c23cdbdb5e54af9980875143506d325f1c6e1db6993ee6029af683bcc2f` |
| OpenSpec                                   | Delta/synchronized validation passed; archived final state: 24 specifications passed              |

Seven temporary omissions independently detected the intended regression:
author-update book list, book details and author revisions; book-delete author
books; import author directory and details; operations list. Each experiment
restored the production file in `finally`. The experiments are not a permanent
mutation-testing dependency or an exhaustive score.

Initial browser runs required Chromium installation. A concurrent production
build overwrote the preview's distribution files; that interrupted run was
excluded and subsequent browser suites used sequential builds. Two later Mock
API runs each had one failure in the existing pre-save store keyboard selection
(one create, one update); a focused run passed create but failed update. Both
cases passed individually on unchanged main. The final change-branch full run,
without concurrent build/check/container preparation, passed all 60. This does
not establish that the selection timing is permanently free of flakiness, and
no existing E2E interaction/worker/timeout settings were changed.

Real API tests used disposable local Compose services. A scratch-only override
appended loopback addresses to existing proxy exclusions and used Node fetch
for the JWKS healthcheck because BusyBox wget sent localhost through the proxy.
No repository Docker or network configuration changed. The same database/JWKS
services were used when switching the API container from pinned release to main;
each test retains its existing unique-user isolation.

Local execution does not perform CI's external Codecov upload. Query refreshes
remain asynchronous, and response loss/server rollback/idempotency remain
outside this frontend cache contract.
