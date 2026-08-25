## Context

`BookList.tsx` currently owns Book-specific column declarations, controlled
TanStack Table state derived from TanStack Router search parameters, navigation
updates, toolbar controls, table markup, and pagination. Existing integrated
component tests exercise filtering, route restoration and synchronization,
sorting, presets, reset, column visibility, and pagination.

This is a behavior-preserving refactor. The URL remains the source of truth,
the current `bookTableFeatures` configuration remains intact, and the existing
tests remain the primary regression boundary.

## Goals / Non-Goals

**Goals:**

- Make `BookList` the composition root for the Book table.
- Keep Book-specific declarations within the Book feature.
- Hide Router search-object details behind a Book-specific hook.
- Give toolbar, table rendering, and pagination focused presentation roles.
- Preserve all existing search, table, and display behavior.

**Non-Goals:**

- Changing UI design, columns, page-size options, presets, or table features.
- Changing the route search schema, GraphQL/API behavior, or query keys.
- Creating a generic DataTable abstraction or refactoring other list screens.
- Splitting small one-use details such as the sort icon into separate files.

## Decisions

1. Export `bookColumns` from `bookColumns.tsx`. The declarations depend on
   Book and Author entities, Book display helpers, feature column metadata,
   routing links, and Boolean rendering, so a generic table utility would hide
   rather than reduce coupling.
2. Introduce `useBookTableSearchState`. It reads the `/books/` route search,
   constructs controlled table state, validates filter and sorting updates,
   and performs replace navigations. It exposes semantic preset and reset
   operations so presentation components do not know the Router search shape.
3. Call `useTable` exactly once in `BookList`. Child components receive the
   resulting Book table instance, avoiding duplicated table construction or a
   large set of parallel data/state props.
4. Split presentation into `BookTableToolbar`, `BookTable`, and
   `BookTablePagination`. `SortIcon` remains internal to `BookTable` because it
   is small and has no independent reuse case.
5. Keep `BookList.test.tsx` as integrated regression coverage. Add focused hook
   tests only if existing coverage leaves synchronization rules unprotected.

## Risks / Trade-offs

- [Extracted callbacks capture stale search state] → Derive each controlled
  state value on every hook render and retain the existing updater semantics.
- [Subtle URL normalization changes] → Move the existing validation and
  omission rules without rewriting them, then run the full BookList suite.
- [Child component types become complex] → Use the natural return type of the
  existing `useTable` invocation or a minimal Book-specific alias only if
  needed.
- [More files increase navigation overhead] → Limit the split to the six
  requested responsibility units and avoid finer-grained components.
