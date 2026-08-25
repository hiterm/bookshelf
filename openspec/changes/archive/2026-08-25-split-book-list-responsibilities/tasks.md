## 1. Extract Book table logic

- [x] 1.1 Move Book-specific column declarations and helpers to `bookColumns.tsx`
- [x] 1.2 Extract URL-backed controlled table state and semantic search actions to `useBookTableSearchState.ts`
- [x] 1.3 Preserve synchronization behavior with the existing BookList regression tests and add focused coverage only if needed

## 2. Split Book table presentation

- [x] 2.1 Extract column visibility, preset, and reset controls to `BookTableToolbar.tsx`
- [x] 2.2 Extract table header, filters, body, sorting, and sort icon to `BookTable.tsx`
- [x] 2.3 Extract pagination and page-size controls to `BookTablePagination.tsx`
- [x] 2.4 Reduce `BookList.tsx` to search-state setup, one table instance, and child-component composition

## 3. Verify behavior

- [x] 3.1 Run generation, formatting/lint, unit tests, and type checking
- [x] 3.2 Review the final diff for preserved URL, table, UI, and API behavior and absence of unrelated refactors
