## Context

The author detail route loads one author with a committed GraphQL operation and
renders metadata and history. The existing local schema snapshot is generated
and ignored by Git, but bookshelf-api 2.12.0 exposes `Author.books`. The book
index cannot be reused directly because it owns `/books` search, sorting, and
pagination state.

## Goals / Non-Goals

**Goals:**

- Fetch related books in the existing author request through `Author.books`.
- Present a compact, accessible table with navigation to book details.
- Keep mock, demo, and real-backend environments aligned with the query.

**Non-Goals:**

- Fetching all books and filtering them in the browser.
- Adding author-book APIs, pagination, sorting, or filtering.
- Changing the order returned by the API.

## Decisions

- Extend `author.graphql` instead of adding a second query. This keeps author
  metadata and related books consistent in one request and directly exercises
  the API's new field.
- Add a small author-specific presentation component instead of reusing
  `BookList`. The existing list is coupled to the `/books` route search state
  and exposes substantially more controls than this detail view needs.
- Select only the book fields displayed by the compact table. Book authors and
  timestamps are intentionally omitted.
- Resolve `Author.books` in the Node mock server and return the equivalent
  nested data from the Demo Mode handler. Integration E2E verifies the same
  operation against bookshelf-api 2.12.0.

## Risks / Trade-offs

- [Generated schema can be stale locally] → Run `pnpm run generate` before
  coding and in validation; commit only source GraphQL operations.
- [Mock implementations can hide backend contract differences] → Add a real
  backend integration scenario that creates an author and related book.
- [An author can have many books] → Accept the API's unpaginated field for this
  release, matching the backend contract and requested compact view.
