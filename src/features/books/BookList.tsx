import { Anchor, Box, Group, Pagination, Select, Table, TextInput, ThemeIcon } from "@mantine/core";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  type Table as ReactTable,
  useReactTable,
} from "@tanstack/react-table";
import { DataGrid } from "mantine-data-grid";

import React from "react";
import { Link } from "react-router-dom";
import { SortAscending, SortDescending } from "tabler-icons-react";
import { Book, BOOK_FORMAT_VALUE, BOOK_STORE_VALUE, displayBookFormat, displayBookStore } from "./schema";

type ColumnType = "string" | "enum";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    type: ColumnType;
    values?: string[];
  }
}

const columnHelper = createColumnHelper<Book>();

// TODO: ストアと形式のフィルタ
// TODO: asを外す
// https://github.com/TanStack/table/issues/4382
// https://github.com/TanStack/table/issues/4302
// https://github.com/TanStack/table/issues/4241
const columns = [
  columnHelper.accessor("title", {
    header: "書名",
    cell: (info) => (
      <Anchor component={Link} to={`/books/${info.row.original.id}`}>
        {info.getValue()}
      </Anchor>
    ),
    filterFn: "includesString",
    meta: { type: "string" },
  }),
  columnHelper.accessor("authors", {
    header: "著者",
    cell: (info) =>
      info
        .getValue()
        .map((author) => author.name)
        .join(", "),
  }),
  columnHelper.accessor("isbn", { header: "ISBN", filterFn: "includesString", meta: { type: "string" } }),
  columnHelper.accessor("format", {
    header: "形式",
    cell: (info) => displayBookFormat(info.getValue()),
    filterFn: "equalsString",
    meta: {
      type: "enum",
      values: BOOK_FORMAT_VALUE,
    },
  }),
  columnHelper.accessor("store", {
    header: "ストア",
    cell: (info) => displayBookStore(info.getValue()),
    filterFn: "equalsString",
    meta: {
      type: "enum",
      values: BOOK_STORE_VALUE,
    },
  }),
  columnHelper.accessor("priority", { header: "優先度", filterFn: "equals" }),
  columnHelper.accessor("read", { header: "既読", filterFn: "equals" }),
  columnHelper.accessor("owned", { header: "所有", filterFn: "equals" }),
  columnHelper.accessor("createdAt", { header: "追加日時" }),
  columnHelper.accessor("updatedAt", { header: "更新日時" }),
] as ColumnDef<Book>[];

type BookListProps = { list: Book[] };

export const BookList: React.FC<BookListProps> = (props) => {
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

type SortIconProps = {
  isSorted: ReturnType<Column<Book>["getIsSorted"]>;
};

const SortIcon: React.FC<SortIconProps> = ({ isSorted }) => {
  switch (isSorted) {
    case false:
      return <></>;
    case "asc":
      return (
        <ThemeIcon variant="light">
          <SortAscending />
        </ThemeIcon>
      );
    case "desc":
      return (
        <ThemeIcon variant="light">
          <SortDescending />
        </ThemeIcon>
      );
    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustivenessCheck: never = isSorted;
      throw new Error("Not exhaustive");
  }
};

type FilterProps = { column: Column<any, unknown>; table: ReactTable<any> };

const Filter: React.FC<FilterProps> = ({ column }) => {
  switch (column.columnDef.meta?.type) {
    case "string":
      return (
        <TextInput
          value={column.getFilterValue() as string}
          onChange={event => column.setFilterValue(event.target.value)}
        />
      );
    case "enum":
      if (column.id === "format") {
        return (
          <Select
            data={BOOK_FORMAT_VALUE.map((format) => ({
              value: format,
              label: displayBookFormat(format),
            }))}
            onChange={value => column.setFilterValue(value)}
          />
        );
      } else {
        return (
          <Select
            data={BOOK_STORE_VALUE.map((format) => ({
              value: format,
              label: displayBookStore(format),
            }))}
            onChange={value => column.setFilterValue(value)}
          />
        );
        return <></>;
      }
    default:
      return <></>;
  }
};

export const BookList2: React.FC<BookListProps> = ({ list }) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: list,
    columns,
    state: { columnFilters, globalFilter, sorting },

    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,

    globalFilterFn: "includesString",

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <Box>
      {/* TODO: Not works */}
      <TextInput value={globalFilter} onChange={event => setGlobalFilter(event.target.value)} />
      <Table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      <Group
                        onClick={header.column.getToggleSortingHandler()}
                        spacing={0}
                        noWrap
                        sx={{ cursor: header.column.getCanSort() ? "pointer" : undefined }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      </Group>
                      {header.column.getCanFilter() ? <Filter column={header.column} table={table} /> : null}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination
        total={table.getPageCount()}
        onChange={(page) => {
          table.setPageIndex(page);
        }}
      />
    </Box>
  );
};
