## Why

The current book import workflow is confined to a Kindle-specific modal and
hard-codes the imported book attributes. A dedicated import workspace should
retain the safe preview-before-import flow while accepting either files or
pasted text and exposing the import choices users need.

## What Changes

- Replace the books-page import modal with a dedicated `/books/import` page.
- Accept Kindle Bookshelf Exporter JSON from a file or pasted text through one
  shared parser path.
- Separate Kindle source parsing from `ImportBookInput` construction and keep
  author source text unsplit until conversion.
- Let users set store, format, owned state, and priority, using the current
  Kindle values as centralized defaults.
- Let users independently opt each book into comma-separated author handling
  without editing the source author text.
- Separate filtering from import selection and preserve selections hidden by
  the purchase-date filter.
- Present editing and preview as distinct steps at the same URL, with a
  responsive two-column editor and sticky action area on wider viewports.
- Preserve the exact successful-preview inputs for import and invalidate stale
  previews whenever import-affecting state changes.
- Remove modal-only state and interactions while retaining persistent API error
  reporting and local source-validation errors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `book-import`: Generalize import sources, settings, selection, author
  conversion, page layout, preview presentation, and post-import navigation.

## Impact

- Affects the book import parser, conversion helpers, UI components, book-list
  navigation, TanStack Router route tree, GraphQL import hooks, and mock state.
- Adds or updates Vitest unit/component/router coverage, Playwright mock-API
  coverage, and real-backend integration coverage without changing the
  `ImportBookInput`, `previewBookImport`, or `importBooks` API contracts.
- Removes the import modal and replaces it with route-scoped page state; no new
  runtime dependency or backend schema change is expected.
