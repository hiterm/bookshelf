## Why

The book import purchase-date filter currently changes only the visible rows, so
selected books outside the visible range are still sent to preview and import.
This makes the displayed target count misleading and can import books the user
intended to exclude.

## What Changes

- Define effective import targets as the intersection of the inclusive
  purchase-date scope and the user's retained selection.
- Use effective import targets for target counts, Preview enablement, and Preview
  inputs while preserving selections hidden by the current date filter.
- Invalidate a successful Preview when the purchase-date filter changes the
  effective inputs.
- Keep visible bulk-selection controls scoped to the currently visible rows.
- Add regression coverage for date boundaries, manual selection, restored targets,
  Preview invalidation, mobile counts, and the zero-target state.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `book-import`: Make purchase-date filtering constrain the candidates eligible
  for Preview and Import in addition to controlling candidate visibility.

## Impact

- Frontend book import state and actions in
  `src/features/books/import/BookImportPage.tsx`.
- Book import component tests and the canonical `book-import` specification.
- No backend API, GraphQL schema, or dependency changes.
