## Why

Book detail pages show author names as plain text, forcing users to return to the author list to open an author's details. Linking each displayed author directly improves navigation between related records.

## What Changes

- Render every author name on a book detail page as a link to that author's detail page.
- Preserve the existing comma-separated author presentation and author-reading display.
- Add component and end-to-end coverage for the author-detail navigation.

## Capabilities

### New Capabilities

- `book-author-navigation`: Navigation from authors displayed on a book detail page to their author detail pages.

### Modified Capabilities

None.

## Impact

- Book detail presentation in `src/features/books/BookDetailShow.tsx`.
- Book detail component tests and mock-API end-to-end tests.
- No API, GraphQL schema, or dependency changes.
