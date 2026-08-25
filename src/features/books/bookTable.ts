import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  filterFn_equalsString,
  filterFn_includesString,
  metaHelper,
  PaginationState,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { Book } from "./entity/Book";

type BookColumnMeta = {
  filterType?: "string" | "boolean" | "store" | "format" | "authors";
};

export const bookTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    equals: filterFn_equals,
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: metaHelper<BookColumnMeta>(),
});

export type BookTable = Table<typeof bookTableFeatures, Book> & {
  readonly state: { pagination: PaginationState };
};
