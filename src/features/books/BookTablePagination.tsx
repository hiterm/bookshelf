import { Center, Pagination, Select } from "@mantine/core";
import React from "react";
import type { BookTable } from "./bookTable";

type BookTablePaginationProps = {
  table: BookTable;
};

export const BookTablePagination: React.FC<BookTablePaginationProps> = ({
  table,
}) => (
  <>
    <Center mt="md" mb="md">
      <Pagination
        total={table.getPageCount()}
        value={table.state.pagination.pageIndex + 1}
        onChange={(page) => {
          table.setPageIndex(page - 1);
        }}
      />
    </Center>
    <Center mt="md" mb="md">
      <Select
        label="Page size"
        data={["20", "50", "100"]}
        value={table.state.pagination.pageSize.toString()}
        onChange={(value) => {
          if (value !== null) {
            table.setPageSize(parseInt(value, 10));
          }
        }}
      />
    </Center>
  </>
);
