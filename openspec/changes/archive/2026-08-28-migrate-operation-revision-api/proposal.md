## Why

Backend PR #324 removes the Event/EventSet GraphQL contract in favor of Operation and entity Revision APIs. The frontend must adopt that breaking contract before the backend change lands so existing history, restore, import, and merge workflows continue to work without a legacy compatibility layer.

## What Changes

- **BREAKING** Replace EventSet queries, identifiers, routes, components, and hooks with Operation equivalents while retaining the existing `/history` navigation entry.
- **BREAKING** Replace BookEvent and AuthorEvent history with BookRevision and AuthorRevision queries identified by entity ID plus revision number.
- **BREAKING** Restore books and authors using entity ID and revision number instead of event ID.
- Consume `operationId` from import, merge, and entity mutation payloads instead of Event/EventSet identifiers.
- Render existing history detail content from Operation changes and their before/after revisions without adding undo or a new full diff experience.
- Replace Event/EventSet mocks, fixtures, handlers, generated GraphQL artifacts, and tests; remove legacy frontend compatibility code.

## Capabilities

### New Capabilities

- `operation-history`: Browse and inspect backend operations and their book/author revision changes through the existing history navigation.

### Modified Capabilities

- `book-history`: Read book history as revisions and restore by book ID plus revision number.
- `author-history`: Read author history as revisions and restore by author ID plus revision number.
- `event-set-history`: Remove the obsolete EventSet-based history capability after its replacement by operation history.

## Impact

GraphQL documents and generated clients, history routes/components/hooks, book and author detail history/restore UI, import and merge flows, MSW/mock stores, Demo Mode, unit tests, and Playwright fixtures are affected. The implementation targets the schema at backend PR #324 head and intentionally does not support the old and new contracts simultaneously.
