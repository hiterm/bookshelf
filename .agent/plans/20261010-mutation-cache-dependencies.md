# Refresh dependent caches after domain mutations

This living ExecPlan follows `.agent/PLANS.md`. Maintain Progress, Surprises & Discoveries, Decision Log and Outcomes & Retrospective as work proceeds.

## Purpose / Big Picture

When a user changes a book or author, already open lists, details and history must update without navigating away or focusing the window. Regression tests keep real query hooks subscribed while mutations execute, so navigation cannot hide missing refreshes.

## Progress

- [x] (2026-10-10) Fetch main, inspect repository rules, Issue #406 and merged PRs #402/#411; baseline is `63b9865b8c87ccb53d5dbedebe4c10d4d01d93ea`.
- [x] Inspect all books/authors/history keys and mutation hooks, GraphQL selections, Demo store and CI.
- [x] Extend active-consumer tests; before corrections all six expanded cases failed (308 other tests passed).
- [x] Add feature-owned invalidation functions, dependency matrix and validated OpenSpec delta.
- [x] Generate, lint, format, all four TypeScript projects, 314 unit tests, coverage and production build pass; seven targeted invalidation omissions are detected.
- [x] Demo E2E: 18 passed.
- [x] Mock API final full run: 60 passed; pinned 2.17.6 and API main: 14 passed each.
- [x] Commit implementation, record exact results and synchronize the specification.
- [ ] Archive OpenSpec in a separate rename-only commit and complete final delivery checks.

## Surprises & Discoveries

PR #402 already protects book update and author merge. PR #411 atomically creates new authors with book saves and already refreshes author list/details. Neither should be reimplemented. Related Issue #404 is closed by #411; the original #401/#406 text remains a historical investigation rather than a current defect list. Current author update omits book list/details and author revisions; book deletion omits author details; import omits author list/details. All eight domain write hooks omit the operations list. Import preview is read-only. Past operation details contain immutable revision snapshots and do not need refresh after a new operation.

## Decision Log

Decision: Extend the existing `src/features/books/api/mutationCache.test.tsx` with typed SDK fixtures and real hooks, retaining infinite stale time and disabled mount/focus/reconnect refresh. Rationale: reuse proven isolation and avoid duplicate merge/update coverage. Date/Author: 2026-10-10, Codex.

Decision: Place explicit domain invalidation functions in feature `api` directories and invalidate the operations list through history's helper. Preserve existing targets; add only dependencies justified by server changes. Rationale: no generic CRUD framework or global cache reset; feature ownership makes each mutation's dependency reviewable. Date/Author: 2026-10-10, Codex.

Decision: Keep pre-save store-selection timing failures outside this cache correction and verify the final full suite with no concurrent preparation work. Rationale: the failure precedes all changed mutation callbacks, both cases pass on unchanged main and the final changed suite passes 60/60. Do not claim permanent flake elimination. Date/Author: 2026-10-10, Codex.

## Outcomes & Retrospective

Implementation and active-consumer verification are complete. Four targeted cases extend the existing two tests instead of duplicating merge/update. Generation, lint/format, all four TypeScript projects, unit tests, coverage, build and OpenSpec delta/synchronized validation pass. Final browser results: Mock API 60, Demo 18, pinned API 14 and API main 14 passed. Earlier store keyboard-selection failures occurred before mutation submission and are recorded in the architecture document; no unrelated test/runtime changes were made. OpenSpec archival and final delivery checks remain pending.

## Context and Orientation

`src/features/books/api/queryKeys.ts`, `src/features/authors/api/queryKeys.ts` and `src/features/history/api/queryKeys.ts` define cache addresses. Lists use `books`, `authors`, `operations`; detail families use singular `book`/`author` and revision families use `bookRevisions`/`authorRevisions`. Invalidating a query means marking its stored response stale and fetching fresh data for active subscribers. Hook APIs obtain an authenticated generated GraphQL SDK through `src/lib/graphqlClient.ts`. Tests replace only this communication boundary and Auth0 token acquisition.

Book mutation responses contain a saved book ID; import returns created book IDs. Author detail includes authored books; book list/detail includes live author names. Revisions and operation details contain historical snapshots, not live author names. Existing merge refreshes all book/author revision families and will retain that behavior. Save conflicts continue to use the independent recovery described in `docs/architecture/atomic-book-save.md`.

## Plan of Work

First extend the typed SDK in `mutationCache.test.tsx` to model author rename, book deletion and import with immutable response objects and new operations. Add mounted `useOperations` and immutable `useOperation` observers. Add rename and import failure/retry cases, deletion association assertions and focused history checks for remaining writes. Run the focused suite before changing production hooks and record demonstrated failures.

Next add `invalidation.ts` under books, authors and history `api`. Each write hook's onSuccess delegates to an explicit function, obtaining all keys from the factories. Keep mutation rejection behavior and caches untouched on failure. Document every mutation and dependent cache in `docs/architecture/mutation-cache-dependencies.md`. Update frontend-query-organization's historical reorganization preservation rule to permit explicitly specified behavior corrections and add successful-write coherence requirements through an OpenSpec proposal/design/tasks/delta. Historical archives remain unchanged.

## Milestones

The baseline milestone establishes the current dependency matrix against latest main and merged fixes. Its observable proof is six expanded cases failing on stale response data before production edits.

The correction milestone supplies explicit feature invalidation functions and successful failure/retry tests. Its proof is six passing active-cache cases and seven deliberate omissions detected independently, with original source restored after every experiment.

The delivery milestone verifies generation, static checks, all unit tests and each distinct browser/API boundary, then syncs and archives OpenSpec. Its proof consists of exact check results and a reviewable committed patch; no API/package/test-setting changes are included.

## Concrete Steps

Run from `/workspace/bookshelf`: `pnpm run test -- src/features/books/api/mutationCache.test.tsx`. Expect new dependent-cache assertions to fail before correction and all cases to pass afterward. Then run `pnpm run generate`, `pnpm run lint:fix`, `pnpm run format`, `pnpm run test`, `pnpm run typecheck`, `pnpm run check`, `pnpm run test:coverage`, `pnpm run build` and `pnpm dlx @fission-ai/openspec@1.6.0 validate --all --strict --no-interactive`. Verify generated schema/types/worker/route tree have no diff. Run mock API and Demo E2E sequentially, preventing server reuse across modes. Real-backend suites require configured backend services; report execution or any concrete environment limitation. Do not change worker, timeout, coverage, dependencies or API contracts.

## Validation and Acceptance

Author rename refreshes authors, that author detail and revisions, and names/yomi in books/list detail. Delete removes the book from subscribed author details. Import refreshes author directory and authored books. Every successful domain write refreshes operations; prior operation detail remains unchanged and is not fetched unnecessarily. Failure rejects, keeps cached data and history, and a later explicit retry succeeds. Existing merge/book-update contracts stay green. Tests compare resulting data after awaiting mutations and refetch completion, not mocked invalidation calls.

## Idempotence and Recovery

Use a fresh QueryClient per test and clear it after unmount. SDK fixtures return immutable snapshots. Re-run checks safely; review formatting and generated diffs before committing. Network commands may need the supported escalated execution path; never alter proxy or package configuration. Keep temporary logs/scripts in `work/`.

## Artifacts and Notes

Latest-main verification: `git fetch origin main` followed by `git merge --ff-only origin/main` reports Already up to date. No files had local changes at start. User requests implementation, so proceed through testing and documentation without an additional approval gate.

## Interfaces and Dependencies

Use existing TanStack Query QueryClient, query-key factories, generated SDK types and Vitest/Testing Library. No package additions. Invalidation helpers return void and schedule existing asynchronous invalidateQueries calls at successful mutation completion, preserving the current mutation lifecycle timing.

Revision note: Initial investigation and execution plan recorded before implementation.

Revision note: Implementation, failure/retry evidence and sensitivity results recorded; browser verification remains in progress.

Revision note: All browser/API suites passed; recorded initial execution issues, exact results and local proxy healthcheck accommodation. Specification synchronized; archive and delivery checks remain.
