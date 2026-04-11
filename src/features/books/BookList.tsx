import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Menu,
  Pagination,
  Popover,
  Select,
  Table,
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
  OnChangeFn,
  PaginationState,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";

import {
  IconLayoutColumns,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import React, { ReactNode, useEffect, useState } from "react";
import { Link } from "../../compoments/mantineTsr";
import { ShowBoolean } from "../../compoments/utils/ShowBoolean";
import { Author } from "./entity/Author";
import { Book } from "./entity/Book";
import { displayBookFormat } from "./entity/BookFormat";
import { displayBookStore } from "./entity/BookStore";
import { Filter } from "./Filter";

type FilterType = "string" | "boolean" | "store" | "format" | "authors";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-definitions
  interface ColumnMeta<TData extends RowData, TValue> {
    filterType: FilterType;
  }
}

const authorsFilter: FilterFn<Book> = (
  row,
  columnId,
  filterValue: string[],
  _addMeta,
) => {
  if (filterValue.length === 0) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const value = row.getValue(columnId) as Author[];
  return value.some((author) => filterValue.includes(author.id));
};

const formatDate = (date: Date) => dayjs(date).format("YYYY/MM/DD HH:mm Z");

const columnHelper = createColumnHelper<Book>();

const columns = [
  columnHelper.accessor("title", {
    header: "書名",
    cell: (info) => (
      <Link to={`/books/$id`} params={{ id: info.row.original.id }}>
        {info.getValue()}
      </Link>
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
  columnHelper.accessor("isbn", {
    header: "ISBN",
    filterFn: "includesString",
    meta: { filterType: "string" },
  }),
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
    cell: (info) => <ShowBoolean flag={info.getValue()} />,
    filterFn: "equals",
    meta: { filterType: "boolean" },
    minSize: 100,
  }),
  columnHelper.accessor("owned", {
    header: "所有",
    cell: (info) => <ShowBoolean flag={info.getValue()} />,
    filterFn: "equals",
    meta: { filterType: "boolean" },
    minSize: 100,
  }),
  columnHelper.accessor("createdAt", {
    header: "追加日時",
    cell: (info) => (
      <Box style={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: "更新日時",
    cell: (info) => (
      <Box style={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>
    ),
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
          <IconSortAscending />
        </ThemeIcon>
      );
    case "desc":
      return (
        <ThemeIcon variant="light">
          <IconSortDescending />
        </ThemeIcon>
      );
    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustivenessCheck: never = isSorted;
      throw new Error("Not exhaustive");
  }
};

export const BookList: React.FC<BookListProps> = ({ list }) => {
  const routeApi = getRouteApi("/books/");
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();

  const [columnFilters, setColumnFilters] = useState(
    (search.columnFilters ?? []) as ColumnFiltersState,
  );
  const [sorting, setSorting] = useState(
    (search.sorting ?? []) as SortingState,
  );
  const [pagination, setPagination] = useState({
    pageIndex: search.pageIndex ?? 0,
    pageSize: search.pageSize ?? 20,
  });

  // Re-sync local state when URL changes externally (browser back/forward).
  // TanStack Router returns a new array reference on every render even when the
  // content is identical, so reference equality would cause infinite updates.
  // JSON.stringify is used for value-based comparison instead.
  // The filter values are always JSON-serializable primitives (string, boolean,
  // number, string[]), so JSON.stringify behaves deterministically here.
  const serializedColumnFilters = JSON.stringify(search.columnFilters ?? []);
  const serializedSorting = JSON.stringify(search.sorting ?? []);

  useEffect(() => {
    setColumnFilters(JSON.parse(serializedColumnFilters) as ColumnFiltersState);
  }, [serializedColumnFilters]);

  useEffect(() => {
    setSorting(JSON.parse(serializedSorting) as SortingState);
  }, [serializedSorting]);

  useEffect(() => {
    setPagination({
      pageIndex: search.pageIndex ?? 0,
      pageSize: search.pageSize ?? 20,
    });
  }, [search.pageIndex, search.pageSize]);

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updater,
  ) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    setColumnFilters(next);
    if (JSON.stringify(next) === JSON.stringify(columnFilters)) return;
    void navigate({
      search: (prev) => ({ ...prev, columnFilters: next, pageIndex: 0 }),
      replace: true,
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(next);
    void navigate({
      search: (prev) => ({ ...prev, sorting: next }),
      replace: true,
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setPagination(next);
    if (
      next.pageIndex === pagination.pageIndex &&
      next.pageSize === pagination.pageSize
    )
      return;
    void navigate({
      search: (prev) => ({
        ...prev,
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
      }),
      replace: true,
    });
  };

  const table = useReactTable({
    data: list,
    columns,
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box>
      <Group>
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon variant="outline">
              <IconLayoutColumns />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Button
              onClick={() => {
                table.toggleAllColumnsVisible();
              }}
            >
              Toggle all
            </Button>
            <Box mt="md">
              {table.getAllLeafColumns().map((column) => {
                return (
                  <Checkbox
                    key={column.id}
                    label={column.columnDef.header as ReactNode}
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                );
              })}
            </Box>
          </Popover.Dropdown>
        </Popover>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>Preset filters</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                table.setColumnFilters(() => [
                  { id: "read", value: false },
                  { id: "owned", value: true },
                ]);
                table.setSorting(() => [{ id: "priority", desc: true }]);
              }}
            >
              Unread owned, order by priority
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button
          onClick={() => {
            setColumnFilters([]);
            setSorting([]);
            setPagination({ pageIndex: 0, pageSize: 20 });
            void navigate({ search: {}, replace: true });
          }}
          color="red"
        >
          Reset filter
        </Button>
      </Group>
      <Box style={{ overflow: "scroll" }}>
        <Table
          withTableBorder
          mt="md"
          style={{ borderLeft: "none", borderRight: "none" }}
        >
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    style={{
                      minWidth: header.column.columnDef.minSize,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <Group
                        onClick={header.column.getToggleSortingHandler()}
                        gap={0}
                        wrap="nowrap"
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : undefined,
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      </Group>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    <Box style={{ fontWeight: "normal" }}>
                      {header.isPlaceholder ? null : header.column.getCanFilter() ? (
                        <Filter column={header.column} table={table} />
                      ) : null}
                    </Box>
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
      <Center mt="md" mb="md">
        <Pagination
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => {
            table.setPageIndex(page - 1);
          }}
        />
      </Center>
      <Center mt="md" mb="md">
        <Select
          label="Page size"
          data={["20", "50", "100"]}
          value={table.getState().pagination.pageSize.toString()}
          onChange={(value) => {
            if (value !== null) {
              table.setPageSize(parseInt(value, 10));
            }
          }}
        />
      </Center>
    </Box>
  );
};
