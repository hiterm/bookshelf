## Why

`BookList.tsx` currently combines Book-specific column declarations, URL-backed
table state, and all table presentation. Splitting these responsibilities will
make the list easier to maintain while preserving the existing user-visible
behavior.

## What Changes

- Move Book-specific column definitions and filters into `bookColumns.tsx`.
- Move Router/Table search-state synchronization into a dedicated hook while
  retaining the URL as the source of truth.
- Split the toolbar, table rendering, and pagination into focused presentation
  components.
- Reduce `BookList` to table creation and child-component composition.
- Preserve the existing BookList component tests as behavior-level regression
  coverage and add focused hook tests only where useful.
- Avoid generic table abstractions and keep the existing table features,
  columns, search parameters, filters, sorting, pagination, presets, and API
  behavior unchanged.

## Capabilities

### New Capabilities

- `book-list-composition`: Defines the responsibility boundaries and
  behavior-preservation requirements for the Book list composition layer.

### Modified Capabilities

None.

## Impact

The change is limited to `src/features/books`, its tests, and the corresponding
OpenSpec artifacts. It does not change GraphQL/API behavior, dependencies,
routes, URL search schemas, or other list screens.
