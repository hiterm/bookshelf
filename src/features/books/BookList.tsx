import {
  Anchor,
  Box,
  Center,
  Checkbox,
  Group,
  Loader,
  MultiSelect,
  Pagination,
  Select,
  Table,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
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
import dayjs from "dayjs";

import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SortAscending, SortDescending } from "tabler-icons-react";
import { useAuthorsQuery } from "../../generated/graphql";
import { Author, Book, BOOK_FORMAT_VALUE, BOOK_STORE_VALUE, displayBookFormat, displayBookStore } from "./schema";

type FilterType = "string" | "boolean" | "store" | "format" | "authors";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterType: FilterType;
  }
}

const authorsFilter: FilterFn<Book> = (row, columnId, filterValue: string[], _addMeta) => {
  if (filterValue.length === 0) {
    return true;
  }

  const value: Author[] = row.getValue(columnId);
  return value.some(author => filterValue.includes(author.id));
};

const formatDate = (date: Date) => (dayjs(date).format("YYYY/MM/DD HH:mm Z"));

const columnHelper = createColumnHelper<Book>();

const columns = [
  columnHelper.accessor("title", {
    header: "書名",
    cell: (info) => (
      <Anchor component={Link} to={`/books/${info.row.original.id}`}>
        {info.getValue()}
      </Anchor>
    ),
    filterFn: "includesString",
    meta: { filterType: "string" },
    minSize: 200,
  }),
  columnHelper.accessor("authors", {
    header: "著者",
    cell: (info) =>
      info
        .getValue()
        .map((author) => author.name)
        .join(", "),
    meta: { filterType: "authors" },
    filterFn: authorsFilter,
    minSize: 200,
  }),
  columnHelper.accessor("isbn", { header: "ISBN", filterFn: "includesString", meta: { filterType: "string" } }),
  columnHelper.accessor("format", {
    header: "形式",
    cell: (info) => displayBookFormat(info.getValue()),
    filterFn: "equalsString",
    meta: { filterType: "format" },
    minSize: 120,
  }),
  columnHelper.accessor("store", {
    header: "ストア",
    cell: (info) => displayBookStore(info.getValue()),
    filterFn: "equalsString",
    meta: { filterType: "store" },
    minSize: 120,
  }),
  columnHelper.accessor("priority", { header: "優先度", filterFn: "equals" }),
  columnHelper.accessor("read", {
    header: "既読",
    filterFn: "equals",
    meta: { filterType: "boolean" },
  }),
  columnHelper.accessor("owned", {
    header: "所有",
    filterFn: "equals",
    meta: { filterType: "boolean" },
  }),
  columnHelper.accessor("createdAt", {
    header: "追加日時",
    cell: (info) => <Box sx={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>,
  }),
  columnHelper.accessor("updatedAt", {
    header: "更新日時",
    cell: (info) => <Box sx={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>,
  }),
] as ColumnDef<Book>[];

type BookListProps = { list: Book[] };

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

type AuthorsFilterProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const AuthorsFilter: React.FC<AuthorsFilterProps> = ({ value, onChange }) => {
  const [queryResult, _reexecuteQuery] = useAuthorsQuery();

  if (queryResult.fetching || queryResult.data == null) {
    return <Loader />;
  }

  if (queryResult.error) {
    return <div>{JSON.stringify(queryResult.error)}</div>;
  }

  return (
    <MultiSelect
      data={queryResult.data?.authors.map((author) => ({
        value: author.id,
        label: author.name,
      })) ?? []}
      searchable
      value={value}
      onChange={(authorIds) => {
        onChange(authorIds);
      }}
    />
  );
};

type FilterProps = { column: Column<any, unknown>; table: ReactTable<any> };

const Filter: React.FC<FilterProps> = ({ column }) => {
  switch (column.columnDef.meta?.filterType) {
    case "string":
      return (
        <TextInput
          value={column.getFilterValue() as string}
          onChange={event => column.setFilterValue(event.target.value)}
        />
      );
    case "boolean":
      return (
        <Select
          data={["-", "true", "false"]}
          onChange={value => {
            if (value === "true") {
              column.setFilterValue(true);
            } else if (value === "false") {
              column.setFilterValue(false);
            } else if (value === "-") {
              column.setFilterValue(undefined);
            }
          }}
        />
      );
    case "format":
      return (
        <Select
          data={BOOK_FORMAT_VALUE.map((format) => ({
            value: format,
            label: displayBookFormat(format),
          }))}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "store":
      return (
        <Select
          data={BOOK_STORE_VALUE.map((format) => ({
            value: format,
            label: displayBookStore(format),
          }))}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "authors":
      return <AuthorsFilter value={column.getFilterValue() as string[]} onChange={column.setFilterValue} />;
    default:
      return <></>;
  }
};

export const BookList: React.FC<BookListProps> = ({ list }) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const table = useReactTable({
    data: list,
    columns,
    state: { columnFilters, sorting, columnVisibility },

    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <Box sx={{ overflow: "scroll" }}>
      <Group spacing="lg">
        {table.getAllLeafColumns().map(column => {
          return (
            <Checkbox
              key={column.id}
              label={column.columnDef.header as ReactNode}
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
          );
        })}
      </Group>
      <Table withBorder mt="md" sx={{ borderLeft: "none", borderRight: "none" }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Box
                  component="th"
                  key={header.id}
                  sx={{ minWidth: header.column.columnDef.minSize, whiteSpace: "nowrap" }}
                >
                  {header.isPlaceholder ? null : (
                    <Group
                      onClick={header.column.getToggleSortingHandler()}
                      spacing={0}
                      noWrap
                      sx={{ cursor: header.column.getCanSort() ? "pointer" : undefined }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon isSorted={header.column.getIsSorted()} />
                    </Group>
                  )}
                </Box>
              ))}
            </tr>
          ))}
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  <Box sx={{ fontWeight: "normal" }}>
                    {header.isPlaceholder ? null : (
                      header.column.getCanFilter() ? <Filter column={header.column} table={table} /> : null
                    )}
                  </Box>
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
      <Center mt="md" mb="md">
        <Pagination
          total={table.getPageCount()}
          onChange={(page) => {
            table.setPageIndex(page);
          }}
        />
      </Center>
    </Box>
  );
};
