# Add the author merge page

This ExecPlan is a living document maintained in accordance with `.agent/PLANS.md`. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must remain current while the feature is implemented.

## Purpose / Big Picture

Users currently have no frontend workflow for the `mergeAuthor` mutation added in bookshelf-api 2.13.0. After this change, a user can open `/authors/merge`, select the author to remove and the author to keep, compare both authors' books, confirm the destructive operation, and arrive at the destination author page after all source relationships have moved. The authors index provides the entry point.

## Progress

- [x] (2026-08-22 02:00Z) Confirm the API contract, repository conventions, route layout, and desired dedicated-page workflow.
- [x] (2026-08-22 02:18Z) Add the GraphQL operation, generated client types, and merge mutation hook.
- [x] (2026-08-22 02:18Z) Build the merge route, author selectors, book previews, validation, notifications, and navigation.
- [x] (2026-08-22 02:18Z) Extend the Node and browser mock stores and resolvers with merge semantics.
- [x] (2026-08-22 02:18Z) Add unit, mock API, demo mode, and integration coverage.
- [x] (2026-08-22 02:18Z) Run all required generation, formatting, unit, type, and end-to-end checks.
- [x] (2026-08-22 02:22Z) Commit the completed feature, push the branch, and create pull request #324.

## Surprises & Discoveries

- Observation: The worktree began at a detached HEAD even though repository rules require feature work on a branch.
  Evidence: `git status --branch --short` reported `HEAD (no branch)`; `feature/merge-authors` was created before edits.

- Observation: The repository already references bookshelf-api 2.13.0, the first release containing `mergeAuthor`, but generated GraphQL files are ignored and produced only by `pnpm run generate`.
  Evidence: `bookshelf-api.version` contains `2.13.0`, while `src/generated` and the downloaded schema are absent before generation.

- Observation: Running a focused demo-mode test immediately after the mock-API suite reused the latter suite's preview server because both use port 4173 and local configurations permit reuse.
  Evidence: The first demo run showed the login screen; rerunning after the prior server stopped rebuilt with `VITE_DEMO_MODE=true` and passed. The complete demo suite subsequently passed.

## Decision Log

- Decision: Use a dedicated `/authors/merge` page where both source and destination are selected.
  Rationale: This matches the requested workflow and makes the operation independent of a particular author detail page.
  Date/Author: 2026-08-22 / Codex and user

- Decision: Load each selected author through the existing `author(id)` query and render both book lists.
  Rationale: The list query does not include books, while the detail query already supplies every field used by `AuthorBookList`, avoiding a new API contract.
  Date/Author: 2026-08-22 / Codex

- Decision: Navigate to the destination detail after success.
  Rationale: The user can immediately verify the destination identity and transferred books.
  Date/Author: 2026-08-22 / Codex and user

## Outcomes & Retrospective

The dedicated merge page, both book previews, API mutation, cache refresh, confirmation flow, and destination navigation are implemented. Node and browser mock stores reproduce API relationship replacement and deduplication, and the frontend was verified against the real API 2.13.0. All planned automated suites pass. The implementation was committed, pushed, and submitted as pull request #324.

## Context and Orientation

GraphQL documents live in `src/graphql/` and `pnpm run generate` downloads the API schema and creates the typed SDK under ignored `src/generated/`. Hooks in `src/components/hooks/` authenticate calls and coordinate TanStack Query caches. File routes live under `src/routes/`; the router generator derives its route tree from those files. `src/routes/authors/index.tsx` lists authors, and `src/features/authors/AuthorBookList.tsx` renders an author's book rows and links.

There are two mock implementations. `e2e-mock-api/mockStore.ts` runs in the Playwright Node process and is isolated per test. `src/mocks/mockStore.ts` runs inside the demo-mode browser service worker and is isolated through a fresh browser context. Both must implement identical merge behavior: replace the source ID with the destination ID in every associated book, deduplicate author IDs, delete the source, and return the unchanged destination.

## Plan of Work

Add `src/graphql/mergeAuthor.graphql` and generate the typed SDK against API 2.13.0. Add `useMergeAuthor` beside the existing mutation hooks, accepting source and destination IDs and invalidating author, book, and event queries after success.

Create a reusable merge page component under `src/features/authors/` and expose it through `src/routes/authors/merge.tsx`. Fetch the authors list for searchable Mantine selects. For each selected ID, call the existing author hook, show a labelled `AuthorBookList`, and cover loading, failure, and empty states. Reject equal IDs, disable submission until valid, display an explicit confirmation modal naming both authors, prevent duplicate submission, report failures through notifications, and navigate to `/authors/$id` with the destination ID after success. Add the authors-index entry link.

Extend both mock stores and their GraphQL resolvers. Add component tests for selection, book previews, validation, mutation inputs, error behavior, and successful navigation. Add Playwright scenarios to the mock API and demo-mode suites, plus a real-backend integration scenario that creates isolated authors and books before merging.

## Concrete Steps

Run all commands from the repository root.

Generate the schema and clients with:

    pnpm run generate

During implementation, run focused Vitest and Playwright commands. Before each commit, run:

    pnpm run generate
    pnpm run lint:fix
    pnpm run test
    pnpm run typecheck

Then run the relevant end-to-end suites:

    pnpm run test:e2e:mock-api
    pnpm run test:e2e:demo-mode
    pnpm run test:integration

After successful checks, inspect the diff, create meaningful English commits, push `feature/merge-authors`, check for an existing pull request, and create or update the pull request body with summary, design decisions, and exact test results.

## Validation and Acceptance

From the authors index, the user can open the merge page. Selecting either author displays that author's current books, including title, ISBN, format, read state, and ownership state. Selecting the same author on both sides produces validation feedback and prevents submission. Confirming a valid pair calls `mergeAuthor` exactly once, removes the source, updates relationships without duplicate destination IDs, shows a success notification, and navigates to the destination detail where moved books appear.

The unit and type suites must pass. The mock API and demo-mode Playwright scenarios must prove the full browser flow in their separate isolation environments. The integration suite should prove compatibility with the real API 2.13.0; if its Docker or external environment is unavailable, record the exact failure rather than claiming it passed.

## Idempotence and Recovery

Generation and test commands are safe to repeat. Mock merges are intentionally not idempotent after success because the source no longer exists, matching the API. If a test fails midway, each mock API test has a fresh store and each demo test has a fresh browser context. Integration tests must create unique users and entities through existing fixtures to avoid shared state. No destructive git reset or broad file deletion is required.

## Artifacts and Notes

The API contract is:

    mergeAuthor(sourceAuthorId: ID!, destinationAuthorId: ID!): MergeAuthorPayload!

The payload returns the destination `author` and the merge `eventSetId`. The frontend only needs the destination ID for navigation, while retaining `eventSetId` in the generated result for future event-set UI work.

## Interfaces and Dependencies

Define a GraphQL operation named `mergeAuthor`, a `useMergeAuthor` hook whose mutation variables are `{ sourceAuthorId: string; destinationAuthorId: string }`, an `AuthorMergePage` component, and the `/authors/merge` file route. Use existing Mantine, TanStack Query, TanStack Router, GraphQL Request, notifications, and `AuthorBookList` dependencies; add no packages.

Plan created 2026-08-22 after the implementation request. It captures the approved dedicated-page workflow, both book previews, and pull-request delivery requirement.

Plan updated 2026-08-22 after implementation and validation. It records the preview-server collision, completed milestones, and passing unit, mock, demo, and real-API coverage.

Plan updated 2026-08-22 after delivery. Pull request #324 now contains the completed and validated feature.
