## Why

Books do not record their purchase calendar date. Kindle exports contain this
information, yet import discards it and manual workflows cannot manage it.

## What Changes

- Add an optional purchase date to create, edit, detail, list, and history.
- Preserve Kindle acquisition dates as calendar dates in preview and import.
- Add purchase-date sorting and inclusive range filtering via URL state.
- Allow codegen to consume an in-progress local backend schema.

## Capabilities

### New Capabilities

- `book-purchase-date`: Manage and display an optional calendar purchase date.

### Modified Capabilities

- `book-import`: Preserve and preview the purchase date submitted for import.
- `book-history`: Display the purchase date captured in each revision.

## Impact

- GraphQL operations, forms, detail, history, list, import, mocks, and tests.
- Code generation configuration and schema-fetch script.
