## Why

bookshelf-api 2.5.0 introduces event history queries (`bookEvents`, `authorEvents`) that allow users to view the edit history of books and authors. Surfacing this history in the UI improves transparency and enables users to audit changes over time.

## What Changes

- Upgrade bookshelf-api dependency from 2.4.1 to 2.5.0
- Add GraphQL queries and types for `bookEvents` and `authorEvents`
- Add MSW mock handlers for history-related queries
- Display book history in the book detail view
- Display author history in the author detail view
- Add unit and E2E tests for history display components

## Capabilities

### New Capabilities
- `book-history`: Display chronological edit history for a single book on its detail page
- `author-history`: Display chronological edit history for a single author on its detail page

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- `bookshelf-api.version` bump to 2.5.0
- `src/generated/*` types regenerated via `npm run generate`
- `src/mocks/handlers.ts` extended with history query mocks
- New UI components in `src/features/books/` and `src/features/authors/` (or shared history component)
- E2E tests updated to assert history visibility
