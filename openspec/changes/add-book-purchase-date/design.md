## Context

The backend adds nullable GraphQL `Date` fields named `purchaseDate` to books,
create/update/import inputs, previews, and revisions. Updates remain full
replacements: `null` clears the purchase date.

## Goals / Non-Goals

**Goals:**

- Treat purchase dates as timezone-free `YYYY-MM-DD` calendar values.
- Carry Kindle acquisition dates through preview and final import.
- Use existing form, table, and URL-query architecture.
- Generate types from the backend worktree schema during development.

**Non-Goals:**

- Compatibility code for older backends.
- Treating purchase dates as timestamps or changing `createdAt` semantics.
- A special filter exclusively for null purchase dates.

## Decisions

- Map GraphQL `Date` to string and keep form values as `YYYY-MM-DD` strings.
- Derive Kindle calendar dates using the existing local-date interpretation.
- Add bounds to validated route search and existing table filtering.
- Add `GRAPHQL_SCHEMA_PATH`; otherwise fetch the pinned released schema.

## Risks / Trade-offs

- [A local schema can be stale] -> Generation is explicit and normal CI keeps
  using its existing released-schema flow.
- [Browser timezone affects timestamps] -> Never convert date-only values to UTC
  and cover conversion in tests.
