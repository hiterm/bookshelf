import { Anchor } from "@mantine/core";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { booleanFilterFn, DataGrid, dateFilterFn, stringFilterFn } from "mantine-data-grid";

import React from "react";
import { Link } from "react-router-dom";
import { Book, displayBookFormat, displayBookStore } from "./schema";

const columnHelper = createColumnHelper<Book>();

// TODO: ストアと形式のフィルタ
// TODO: asを外す
// https://github.com/TanStack/table/issues/4382
// https://github.com/TanStack/table/issues/4302
// https://github.com/TanStack/table/issues/4241
const columns: ColumnDef<Book>[] = [
  columnHelper.accessor("title", {
    header: "書名",
    cell: (info) => (
      <Anchor component={Link} to={`/books/${info.row.original.id}`}>
        {info.getValue()}
      </Anchor>
    ),
    filterFn: stringFilterFn,
  }),
  columnHelper.accessor("authors", {
    header: "著者",
    cell: (info) =>
      info
        .getValue()
        .map((author) => author.name)
        .join(", "),
  }),
  { accessorKey: "isbn", header: "ISBN", filterFn: stringFilterFn },
  columnHelper.accessor("format", {
    header: "形式",
    cell: (info) => displayBookFormat(info.getValue()),
  }),
  columnHelper.accessor("store", {
    header: "ストア",
    cell: (info) => displayBookStore(info.getValue()),
  }),
  { accessorKey: "priority", header: "優先度", filterFn: stringFilterFn },
  { accessorKey: "read", header: "既読", filterFn: booleanFilterFn },
  { accessorKey: "owned", header: "所有", filterFn: booleanFilterFn },
  { accessorKey: "createdAt", header: "追加日時", filterFn: dateFilterFn },
  { accessorKey: "updatedAt", header: "更新日時", filterFn: dateFilterFn },
] as ColumnDef<Book>[];

export const BookList: React.FC<{ list: Book[] }> = (props) => {
  return (
    <DataGrid
      columns={columns}
      data={props.list}
      striped
      highlightOnHover
      withGlobalFilter
      withPagination
      withColumnFilters
      withSorting
    />
  );
};
