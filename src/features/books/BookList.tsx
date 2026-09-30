import { Box } from "@mantine/core";
import { useTable } from "@tanstack/react-table";
import React, { useState } from "react";
import { Book } from "./entity/Book";
import { bookColumns } from "./bookColumns";
import { bookTableFeatures } from "./bookTable";
import { BookTable } from "./BookTable";
import { BookTablePagination } from "./BookTablePagination";
import { BookTableToolbar } from "./BookTableToolbar";
import { useBookTableSearchState } from "./useBookTableSearchState";

type BookListProps = { list: Book[] };

export const BookList: React.FC<BookListProps> = ({ list }) => {
  const [filterResetKey, setFilterResetKey] = useState(0);
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
        onReset={() => {
          // Reset must also discard drafts when the URL is already unfiltered.
          setFilterResetKey((previous) => previous + 1);
          resetSearch();
        }}
      />
      <BookTable table={table} filterResetKey={filterResetKey} />
      <BookTablePagination table={table} />
    </Box>
  );
};
