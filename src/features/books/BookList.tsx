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
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
  flexRender,
  OnChangeFn,
  PaginationState,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";

import {
  IconLayoutColumns,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import React from "react";
import { Link } from "../../compoments/mantineTsr";
import { BooleanValue } from "../../compoments/utils/BooleanValue";
import { authorSchema } from "./entity/Author";
import { Book } from "./entity/Book";
import { displayBookFormat } from "./entity/BookFormat";
import { displayBookStore } from "./entity/BookStore";
import { ColumnFilter } from "./ColumnFilter";
import { displayAuthorYomis } from "./displayAuthorYomis";
import { bookColumnFiltersSchema, bookSortingSchema } from "./bookSearch";
import { bookTableFeatures } from "./bookTable";

const authorsFilter: FilterFn<typeof bookTableFeatures, Book> = (
  row,
  columnId,
  filterValue: string[],
  _addMeta,
) => {
  if (filterValue.length === 0) {
    return true;
  }

  const value = row.getValue(columnId);
  if (!Array.isArray(value)) return false;
  return value.some((item) => {
    const parsed = authorSchema.safeParse(item);
    return parsed.success && filterValue.includes(parsed.data.id);
  });
};

const formatDate = (date: Date) => dayjs(date).format("YYYY/MM/DD HH:mm Z");

const DEFAULT_PAGE_SIZE = 20;

const columnHelper = createColumnHelper<typeof bookTableFeatures, Book>();

const columns = columnHelper.columns([
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
  columnHelper.accessor((book) => displayAuthorYomis(book.authors), {
    id: "authorYomis",
    header: "著者読み仮名",
    filterFn: "includesString",
    meta: { filterType: "string" },
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
    cell: (info) => <BooleanValue flag={info.getValue()} />,
    filterFn: "equals",
    meta: { filterType: "boolean" },
    minSize: 100,
  }),
  columnHelper.accessor("owned", {
    header: "所有",
    cell: (info) => <BooleanValue flag={info.getValue()} />,
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
]);

type BookListProps = { list: Book[] };

type SortIconProps = {
  isSorted: ReturnType<Column<typeof bookTableFeatures, Book>["getIsSorted"]>;
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

  const columnFilters = search.columnFilters ?? [];
  const sorting = search.sorting ?? [];
  const pagination = {
    pageIndex: search.pageIndex ?? 0,
    pageSize: search.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updater,
  ) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    if (JSON.stringify(next) === JSON.stringify(columnFilters)) return;
    const parsed = bookColumnFiltersSchema.safeParse(next);
    if (!parsed.success) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        columnFilters: parsed.data.length === 0 ? undefined : parsed.data,
        pageIndex: undefined,
      }),
      replace: true,
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (JSON.stringify(next) === JSON.stringify(sorting)) return;
    const parsed = bookSortingSchema.safeParse(next);
    if (!parsed.success) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        sorting: parsed.data.length === 0 ? undefined : parsed.data,
        pageIndex: undefined,
      }),
      replace: true,
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    if (
      next.pageIndex === pagination.pageIndex &&
      next.pageSize === pagination.pageSize
    )
      return;
    void navigate({
      search: (prev) => ({
        ...prev,
        pageIndex: next.pageIndex === 0 ? undefined : next.pageIndex,
        pageSize:
          next.pageSize === 50 || next.pageSize === 100
            ? next.pageSize
            : undefined,
      }),
      replace: true,
    });
  };

  const table = useTable({
    features: bookTableFeatures,
    data: list,
    columns,
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
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
                    label={
                      typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id
                    }
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
                void navigate({
                  search: (prev) => ({
                    ...prev,
                    columnFilters: [
                      { id: "read", value: false },
                      { id: "owned", value: true },
                    ],
                    sorting: [{ id: "priority", desc: true }],
                    pageIndex: undefined,
                  }),
                  replace: true,
                });
              }}
            >
              Unread owned, order by priority
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button
          onClick={() => {
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
                        <ColumnFilter column={header.column} />
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
    </Box>
  );
};
