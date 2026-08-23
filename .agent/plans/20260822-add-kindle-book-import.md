# Add Kindle book bulk import

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds. This document is maintained in accordance with `.agent/PLANS.md`.

## Purpose / Big Picture

After this change, a signed-in user can upload the JSON file produced by Kindle Bookshelf Exporter, review its books before changing their bookshelf, optionally include only purchases on or after a chosen date, exclude individual books, and submit the remaining books in one request. Successful imports appear in the existing book list; failed imports leave the dialog state intact so the user can retry. The first version deliberately does not persist Kindle ASINs, purchase dates, cover URLs, or a last-import timestamp, and it relies on the backend's existing duplicate and author-resolution behavior.

## Progress

- [x] (2026-08-22 00:00Z) Create `feature/kindle-book-import` before investigation or edits.
- [x] (2026-08-22 00:05Z) Read `.agent/PLANS.md`, inspect the repository layout, and confirm the exporter and API contracts.
- [x] (2026-08-22 02:25Z) Add the GraphQL operation, regenerate types, and implement the authenticated mutation hook.
- [x] (2026-08-22 02:29Z) Implement and unit-test exporter validation, normalization, input conversion, and inclusive purchase-date filtering (10 focused tests pass).
- [x] (2026-08-22 02:29Z) Implement and component-test the upload, filtering, preview, selection, bulk submission, retry, and route UI (7 focused tests pass).
- [x] (2026-08-22 02:32Z) Extend the browser GraphQL mock and add the main mocked-browser import flow (focused Playwright scenario passes).
- [x] (2026-08-22 02:33Z) Add a real-backend integration flow that proves the generated operation and backend author behavior; execution remains part of final validation.
- [x] (2026-08-22 02:57Z) Run all required generation, formatting, unit, type, build, mocked E2E, and integration checks; the latest review-follow-up CI passed 24 unit files with 161 tests, typecheck, build, and 8 integration tests. Mock E2E completed with 45 of 46 tests passing and `sort persists on page reload` reported as flaky.
- [x] (2026-08-22 03:20Z) Review and commit meaningful units after mandatory pre-commit checks, push the branch, create PR #325, and verify every GitHub check succeeds.
- [x] (2026-08-22 15:29Z) Address subagent review by discarding stale asynchronous file reads and add a regression test for out-of-order completion.

## Surprises & Discoveries

- Observation: the worktree began at a detached HEAD rather than `main` or another named branch.
  Evidence: `git --no-pager status --short --branch` printed `## HEAD (no branch)`; the feature branch was created before investigation.
- Observation: generated GraphQL files and the fetched schema are absent until generation runs, and the first sandboxed `pnpm run generate` could not open pnpm's database.
  Evidence: rerunning the same command with approved filesystem/network access fetched the pinned schema and generated the SDK successfully.
- Observation: Kindle Bookshelf Exporter emits its `authors` value directly from Amazon as a string; its JSON writer does not split or restructure it.
  Evidence: upstream `content.js` maps each item to `{ title, authors, acquiredTime, readStatus, asin, productImage }`, while its CSV writer calls string methods directly on `authors`.
- Observation: the first focused Playwright run timed out before tests because the initial Vite production build took about 50 seconds and exceeded the combined 60-second web-server window.
  Evidence: a standalone build completed successfully in 50.37 seconds; after its cache was warm, the identical focused Playwright scenario built in 10.35 seconds and passed in 2.2 seconds.
- Observation: running Vite's type-checking build concurrently with the three integration containers could exceed Playwright's 120-second web-server timeout even though the same build and tests passed when resource usage was separated.
  Evidence: building the integration frontend first, reusing its local preview, and then starting the API produced a 3.2-second focused pass and an 8-of-8 full integration pass. `playwright.integration.config.ts` now matches the mock config by reusing an existing local server outside CI; CI remains isolated.
- Observation: the existing `BookList.test.tsx` has individual 5-second test limits that can flake under concurrent host load.
  Evidence: two full-suite runs timed out in different existing tests, while the file passed 29 of 29 alone and the required unmodified `pnpm run test` later passed 159 of 159 after integration workloads stopped.

## Decision Log

- Decision: Treat the supported external document as a root JSON array whose entries require `title`, string `authors`, numeric millisecond `acquiredTime`, `readStatus` equal to `READ` or `UNKNOWN`, and `asin`; accept optional `productImage` and unknown extra properties.
  Rationale: this is the exact JSON mapping in Kindle Bookshelf Exporter 0.9.4. Keeping unknown properties makes additive exporter changes compatible without accepting a different document shape.
  Date/Author: 2026-08-22 / Codex
- Decision: Normalize the exporter author string to one `authorNames` array element and do not split punctuation or conjunctions.
  Rationale: the exporter exposes one opaque string and provides no author delimiter contract. Splitting would invent a format and can corrupt names; backend author resolution remains authoritative.
  Date/Author: 2026-08-22 / Codex
- Decision: Interpret `acquiredTime` as Unix epoch milliseconds and compare it against the selected local calendar date at local midnight, inclusively.
  Rationale: upstream passes `acquiredTime` to JavaScript `Date`, and `input[type=date]` represents a local user calendar date. Inclusive comparison implements “指定日以降” without UTC date-boundary surprises.
  Date/Author: 2026-08-22 / Codex
- Decision: Map imported books to the generated `ImportBookInput` with empty ISBN, owned true, priority 50, format `E_BOOK`, and store `KINDLE`; omit ASIN, purchase date, and image URL.
  Rationale: the pinned API schema has only the eight required fields and explicitly assigns author creation to `importBooks`. ASIN is not an ISBN.
  Date/Author: 2026-08-22 / Codex
- Decision: Run Vitest files sequentially by setting `test.fileParallelism` to false while retaining every existing per-test timeout.
  Rationale: repeated exact `pnpm run test` executions under the available single-worker host starved different existing `BookList` UI tests for tens of seconds, while all 29 passed alone. Sequential files preserve assertion strictness and make the mandatory suite deterministic across constrained CI and development hosts.
  Date/Author: 2026-08-22 / Codex
- Decision: Do not start `vite-plugin-checker`'s TypeScript watcher inside Vitest.
  Rationale: the watcher duplicated the mandatory `pnpm run typecheck` and continued to starve a random BookList test even after files were sequential. The checker remains active for development and production builds, and the full standalone TypeScript command still runs before every commit.
  Date/Author: 2026-08-22 / Codex
- Decision: Keep file-extension enforcement at the browser file chooser through the existing `accept` attribute.
  Rationale: the review noted that `accept` is advisory, and the user explicitly accepted that behavior. Content still must pass the strict Kindle exporter schema regardless of filename.
  Date/Author: 2026-08-22 / Codex

## Outcomes & Retrospective

The complete user flow is implemented, validated, committed, and available in PR #325. The importer uses one generated `importBooks` request, preserves retry state, ignores stale file reads, performs no ASIN-to-ISBN substitution, and displays refreshed author data from the backend. The latest review-follow-up CI passed 24 unit files with 161 tests, typecheck, build, and 8 real-backend integration tests. Mock E2E completed successfully with 45 of 46 tests passing and the existing `sort persists on page reload` test reported as flaky.

## Context and Orientation

The application is a React and TypeScript frontend using Mantine for controls, TanStack Query for remote mutation state, GraphQL Request with generated types, Vitest for logic and component behavior, and Playwright for browser flows. GraphQL source operations live under `src/graphql/`; `scripts/fetch-schema.sh` fetches the bookshelf-api revision named by `bookshelf-api.version`, and `pnpm run generate` writes ignored artifacts under `src/generated/`. Existing mutation hooks such as `src/compoments/hooks/useCreateBook.ts` obtain an authenticated SDK through `src/lib/graphqlClient.ts` and invalidate `['books']` after success.

The book-list route is `src/routes/books/index.tsx`, its existing add control is `src/features/books/BookAddButton.tsx`, and the bulk-import modules will live under `src/features/books/import/`. “External model” means the untrusted shape in the uploaded exporter file. “Internal model” means the validated `ImportedBook` values used by the UI. Only the converter at the GraphQL boundary creates generated `ImportBookInput` values.

Mocked browser tests use the per-test Node-process `MockStore` in `e2e-mock-api/mockStore.ts` and resolvers in `e2e-mock-api/resolvers.ts`. Integration tests in `e2e-integration/` use a unique authenticated user for each Playwright page against the real bookshelf-api. These suites prove different boundaries and must not repeat every parser assertion.

## Plan of Work

First add `src/graphql/importBooks.graphql`, selecting `eventSetId` and each returned book's `id` and `title`, then regenerate the SDK. Add `src/compoments/hooks/useImportBooks.ts` with a mutation accepting generated `ImportBookInput[]`, one `sdk.importBooks({ books })` call, and book-query invalidation on success.

Next create `src/features/books/import/kindleExportSchema.ts`, `parseKindleExport.ts`, `toImportBookInput.ts`, and `filterImportedBooks.ts`. The parser begins with `JSON.parse` into `unknown`, validates with Zod, rejects malformed JSON, missing required data, invalid timestamps, and unsupported statuses with a clear import error, and returns dates plus the source ASIN and optional image URL. Tests use an anonymous minimal fixture matching upstream output. Pure conversion tests prove ASIN never reaches ISBN; pure filter tests prove an unchanged input array and an inclusive local-calendar boundary.

Then create `BookImportDialog.tsx` and `BookImportButton.tsx`. The button owns open state. The dialog accepts only JSON files, reads with `File.text()`, retains the complete parsed array separately from derived filtered rows, tracks selection by a stable per-upload row key rather than ASIN uniqueness assumptions, and exposes counts, title, author text, purchase date, read state, row checkboxes, select-all, and clear-all. A missing date shows all rows; hidden rows are not submitted. Changing a filter must not destroy the source array, and rows that become visible again can be selected again. Submission converts only visible selected rows and calls the bulk mutation once. While pending, relevant controls and repeat submission are disabled. Success reports the returned book count, closes, and resets on the next open; failure reports an error while preserving all state.

Add the import button beside the existing add button in `src/routes/books/index.tsx` with an explicit accessible name. Component tests mock the mutation hook and cover state transitions, exact one-call submission data, pending protection, success close, and failure retention. Parser and pure function error cases remain in their own unit tests rather than being duplicated in browser suites.

Extend `e2e-mock-api/mockStore.ts` with an import method that resolves existing authors by exact name, creates absent authors, creates all books, and returns one event-set identifier plus created books. Wire `Mutation.importBooks` in `e2e-mock-api/resolvers.ts`. Add an anonymous JSON fixture under a shared E2E fixture location and a Playwright scenario covering upload, preview, inclusive filtering, exclusion, one import, success notification, dialog close, and list refresh.

Add an integration scenario using the same exporter-shaped fixture with unique titles and authors. It verifies the frontend operation against the real schema, successful import, refreshed list rows, and visible author names. It does not inspect event internals or transactions. If the pinned backend cannot start or lacks the mutation despite the fetched schema, record the environment evidence rather than weakening the contract test.

Finally run all required commands, update this plan with observed results, inspect status/diff/log using `git --no-pager`, and commit meaningful parser, UI, and E2E units. Before every non-documentation commit run `pnpm run generate`, `pnpm run lint:fix`, `pnpm run test`, and `pnpm run typecheck`. Push `feature/kindle-book-import`, create a PR titled `Add Kindle book bulk import`, ensure its summary and test list reflect actual results, inspect changed files and CI, and fix implementation-caused failures on the same branch until all checks pass.

## Concrete Steps

All commands run from the repository root `/home/hiterm/.codex/worktrees/3d3355fd-8630-42f6-bd97-c7542fff360d/bookshelf`.

    pnpm run generate
    pnpm run lint:fix
    pnpm run test
    pnpm run typecheck
    pnpm run build
    pnpm run test:e2e:mock-api
    pnpm run integration:up
    pnpm run test:integration
    pnpm run integration:down

Generation should fetch `schema.graphql`, generate `src/generated/graphql-request.ts` with an `importBooks` SDK method, refresh the MSW worker, and regenerate the TanStack route tree. Unit, type, build, and E2E commands must exit zero. `integration:down` must run even if integration tests fail so local containers do not remain running.

For each commit, repeat the mandatory generation, formatting, unit, and typecheck commands immediately before `git commit`. At handoff, inspect:

    git --no-pager status --short --branch
    git --no-pager diff --stat origin/main...HEAD
    git --no-pager log --oneline --decorate origin/main..HEAD

## Validation and Acceptance

Vitest acceptance requires real exporter JSON to normalize multiple books, READ to true, UNKNOWN to false, millisecond purchase timestamps to valid dates, opaque author strings to one-element author arrays, extra properties to be ignored, and malformed JSON, missing fields, unsupported statuses, and invalid dates to fail. Conversion acceptance requires every API default and proves ASIN is absent from ISBN. Filtering acceptance requires no-date all rows, before-date exclusion, same-day inclusion, later-date inclusion, and no source mutation.

Component acceptance requires an uploaded file to reveal a preview and accurate counts; changing or clearing the date to recompute visible rows without data loss; row and bulk selection actions to update the count; zero selection to disable import; invalid files never to call the mutation; selected visible rows to be converted and sent in exactly one mutation; pending state to prevent duplicate submission; success to notify and close; and failure to notify while retaining file, filter, and selection state for retry.

Mock E2E acceptance requires a browser user to complete the full upload-to-list flow with only selected, date-eligible books appearing after import. Integration acceptance requires the same generated GraphQL operation to work against the real backend and returned books to reappear with their authors after query invalidation. Existing add and list tests must remain green with unambiguous role-and-name selectors.

## Idempotence and Recovery

Generation, formatting, unit tests, typechecks, and builds are repeatable. Import tests must use per-test stores or unique real-backend users and unique titles, so reruns do not conflict. The UI intentionally provides no stronger duplicate prevention than the current backend; a human manually importing the same file twice may create whatever duplicates the backend currently permits. Integration containers are cleaned up with `pnpm run integration:down`; if startup or tests fail, run the down command before retrying. Do not delete user changes or reset the worktree to recover.

## Artifacts and Notes

Upstream exporter 0.9.4 constructs JSON as a root array with entries equivalent to:

    {
      "title": item["title"],
      "authors": item["authors"],
      "acquiredTime": item["acquiredTime"],
      "readStatus": item["readStatus"],
      "asin": item["asin"],
      "productImage": item["productImage"]
    }

The pinned bookshelf-api schema defines `ImportBookInput` with required `title`, `authorNames`, `isbn`, `read`, `owned`, `priority`, `format`, and `store`, and defines `importBooks(books: [ImportBookInput!]!): ImportBooksPayload!`. `ImportBooksPayload` contains non-null `eventSetId` and `books`.

## Interfaces and Dependencies

Use existing `zod`, React, Mantine, TanStack Query, GraphQL Request, Vitest, Testing Library, and Playwright dependencies; add no JSON parser or date library. Define and export an internal `ImportedBook` containing `title: string`, `authorNames: string[]`, `purchasedAt: Date`, `read: boolean`, `asin: string`, and optional `imageUrl: string`. Define `parseKindleExport(text: string): ImportedBook[]`, `toImportBookInput(book: ImportedBook): ImportBookInput`, and a pure filter accepting the source array plus an optional `YYYY-MM-DD` date string. `useImportBooks` exposes a TanStack mutation whose input is `ImportBookInput[]`. `BookImportDialog` accepts `opened: boolean` and `onClose: () => void`; `BookImportButton` owns those props' state.

Revision note (2026-08-22): Created the initial self-contained plan after confirming the upstream exporter 0.9.4 output mapping and the pinned bookshelf-api GraphQL contract. This resolves the previously ambiguous author and date representations before implementation.

Revision note (2026-08-22 02:33Z): Updated progress, outcomes, and discoveries after completing the application and test implementation. Recorded the one-time Vite build timing because it explains the initial Playwright infrastructure timeout and successful retry.

Revision note (2026-08-22 02:57Z): Recorded complete validation results, the existing unit-test timeout behavior under load, and the resource-separated integration procedure. Updated the integration Playwright local-server decision while retaining isolated CI behavior.

Revision note (2026-08-22 03:04Z): Added the Vitest file scheduling decision after repeated mandatory-suite retries timed out in different pre-existing BookList tests despite a green isolated file. This changes scheduling rather than weakening test timeouts or assertions.

Revision note (2026-08-22 03:09Z): Disabled the redundant Vite TypeScript checker only during Vitest after tracing continued single-test starvation to the checker watcher. Development, build, and mandatory standalone type checking remain unchanged.

Revision note (2026-08-22 03:13Z): Corrected the final unit-test count after adding the nullable image fixture and recorded implementation commit `b159324`. Push, PR, and CI remain active work.

Revision note (2026-08-22 03:16Z): Recorded the branch push and creation of PR #325. Only remote CI verification remains.

Revision note (2026-08-22 03:20Z): Marked the plan complete after all PR #325 checks passed, including both integration-backend versions and all browser suites.

Revision note (2026-08-22 15:29Z): Recorded the subagent review outcome, the accepted advisory file-extension behavior, and the stale-read race fix with its regression test.

Revision note (2026-08-22): Addressed GitHub review feedback by making the shared E2E fixture timezone-stable, asserting that date-ineligible books remain absent after import, reusing the generated GraphQL input type in the mock store, and associating mock import events with the returned event-set identifier. The event assertions remain outside frontend E2E scope.

Revision note (2026-08-23): Updated validation results from the latest CI run, recorded the existing flaky sort-persistence E2E, and added a mock-store regression test for the shared import event-set identifier.

Revision note (2026-08-23): Moved the direct mock-store event-set regression test from Playwright to Vitest so browser E2E remains limited to user-facing flows.
