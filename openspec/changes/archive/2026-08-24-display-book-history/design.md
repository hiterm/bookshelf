## Context

The frontend is a React application using TanStack Router, TanStack Query, Mantine UI, and GraphQL (graphql-request). It currently consumes bookshelf-api 2.4.1, which does not include history APIs. bookshelf-api 2.5.0 adds `bookEvents` and `authorEvents` queries, returning chronological edit history entries (`BookEventEntry`, `AuthorEventEntry`). This change integrates those queries into the existing detail pages.

## Goals / Non-Goals

**Goals:**
- Display chronological edit history on the book detail page
- Display chronological edit history on the author detail page
- Add GraphQL documents, generated types, and React Query hooks for the new queries
- Add MSW mock handlers so demo mode and tests continue to work
- Add unit and E2E test coverage for the new UI sections

**Non-Goals:**
- Restore functionality (`restoreBook`, `restoreAuthor`) — out of scope for this change
- Real-time or live updates for history entries
- Pagination or filtering of history entries

## Decisions

### History displayed as a detail-page section
We will add the history list below the existing detail content on `/books/$id` and `/authors/$id`, rather than creating new sub-routes. This keeps the UX simple and avoids extra navigation.

**Rationale:** Users are likely checking history in the context of the item they are already viewing. A separate page would add friction.

**Alternative considered:** A dedicated `/books/$id/history` route. Rejected because it adds complexity for a read-only list that fits naturally at the bottom of the existing page.

### Use simple Mantine Table for history lists
We will use a plain Mantine `Table` component for history entries instead of TanStack React Table.

**Rationale:** TanStack React Table is powerful but adds boilerplate for sorting, filtering, and pagination state. History entries are append-only and typically short; full table features are unnecessary.

**Alternative considered:** TanStack React Table. Rejected to avoid over-engineering.

### Reuse existing date formatting
History timestamps will be formatted with `dayjs` in `YYYY/MM/DD HH:mm:ss`, matching the existing `createdAt`/`updatedAt` display in `BookDetailShow`.

### Resolve author names from IDs in history entries
`BookEventEntry` stores `authorIds`, not resolved author names. We will display the names by looking them up from the existing author cache or using a simple join, following the same pattern used for resolving book authors in mock handlers.

## Risks / Trade-offs

- [Risk] API version bump to 2.5.0 may introduce unrelated schema changes that break existing types.
  → Mitigation: Run `npm run generate` and `npm run typecheck` immediately after the version bump; fix any new type errors before proceeding.
- [Risk] Mock history data must be manually curated in MSW handlers and MockStore.
  → Mitigation: Keep mock entries minimal (2-3 events per entity) to reduce maintenance burden while still covering test scenarios.
- [Risk] `BookEventEntry.authorIds` resolution requires author data to be available.
  → Mitigation: In the detail page, authors are already loaded; we can reuse that data. In mocks, ensure mock authors exist for the IDs referenced in history entries.

