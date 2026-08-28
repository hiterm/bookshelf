## Context

The frontend currently models change history with EventSet, BookEvent, and AuthorEvent GraphQL types. Backend PR #324 deletes those queries and mutation payload fields and introduces Operation, OperationChange, BookRevision, and AuthorRevision. The frontend must switch atomically to the new schema; compatibility with the current backend main schema is explicitly out of scope.

## Goals / Non-Goals

**Goals:**

- Make backend PR #324's schema the single GraphQL contract used by the frontend.
- Preserve the current history navigation and user workflows while renaming implementation concepts to Operation and Revision.
- Use entity ID plus revision number for revision lookup and restore.
- Keep mocks, Demo Mode, generated artifacts, unit tests, and E2E coverage aligned with the production contract.

**Non-Goals:**

- Undo UI or calls to a future undo mutation.
- A newly designed or comprehensive revision diff experience.
- Supporting both Event/EventSet and Operation/Revision schemas.

## Decisions

1. Keep `/history` as the user-facing route and rename only its dynamic parameter to `$operationId`. The navigation already presents this area as generic change history, so changing the URL to `/operations` would create user-facing churn without adding value.
2. Replace GraphQL documents and generated code in one migration. A compatibility layer would hide contract mistakes and is prohibited by the rollout plan.
3. Render each OperationChange from its `beforeRevision` and `afterRevision`. The after revision is the primary snapshot when present; deletion changes can fall back to the before revision. Both snapshots remain available to represent the existing detail content without creating a new diff system.
4. Preserve the existing book/author history presentation where practical, but source rows from revisions and identify actions by revision number and creation time. Restore mutations receive the route entity ID and selected revision number.
5. Model mock history with the same operation and revision relationships as GraphQL. Mutation helpers record operation IDs and monotonically increasing revision numbers so mock API and Demo Mode exercise the real contract shape.

## Risks / Trade-offs

- [Backend PR changes while implementation is in progress] → Pin schema work to the latest PR head, re-check the head before final validation, and regenerate if it changes.
- [Frontend CI queries the pre-merge backend schema] → Accept only known contract-transition failures before backend merge; do not restore legacy fields.
- [Revision records do not contain an explicit operation type] → Display revision number and timestamp in entity history, and reserve operation labels/details for Operation pages.
- [Large mock rename causes hidden stale assumptions] → Search the full source/test tree for legacy identifiers and run unit, mock API, and Demo Mode suites.
