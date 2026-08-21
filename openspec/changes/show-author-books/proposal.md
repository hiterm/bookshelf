## Why

Author detail pages currently show author metadata and history but do not show
which books belong to the author. bookshelf-api 2.12.0 now exposes related
books through `Author.books`, so the detail page can present that relationship
without fetching and filtering every book in the browser.

## What Changes

- Query `Author.books` as part of the existing author detail request.
- Display the author's books in a compact table with links to book details.
- Display an explicit empty state when the author has no books.
- Support the new query shape in mock API and Demo Mode implementations.
- Cover the behavior with component, mock, demo, and real-backend tests.

## Capabilities

### New Capabilities

- `author-book-list`: Display books related to an author on the author detail page.

### Modified Capabilities

None.

## Impact

- The committed author GraphQL operation and its generated local types.
- Author detail UI and tests.
- Mock API, Demo Mode, and integration E2E fixtures and scenarios.
- No backend schema or API version changes; the project already targets
  bookshelf-api 2.12.0.
