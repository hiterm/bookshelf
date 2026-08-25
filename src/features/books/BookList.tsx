import { Box } from "@mantine/core";
import { useTable } from "@tanstack/react-table";
import React from "react";
import { Book } from "./entity/Book";
import { bookColumns } from "./bookColumns";
import { bookTableFeatures } from "./bookTable";
import { BookTable } from "./BookTable";
import { BookTablePagination } from "./BookTablePagination";
import { BookTableToolbar } from "./BookTableToolbar";
import { useBookTableSearchState } from "./useBookTableSearchState";

type BookListProps = { list: Book[] };

export const BookList: React.FC<BookListProps> = ({ list }) => {
  const {
    state,
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    applyUnreadOwnedPreset,
    resetSearch,
  } = useBookTableSearchState();

  const table = useTable({
    features: bookTableFeatures,
    data: list,
    columns: bookColumns,
    state,
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
  });

  return (
    <Box>
      <BookTableToolbar
        table={table}
        onApplyUnreadOwnedPreset={applyUnreadOwnedPreset}
        onReset={resetSearch}
      />
      <BookTable table={table} />
      <BookTablePagination table={table} />
    </Box>
  );
};
