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
import { Column, flexRender, useTable } from "@tanstack/react-table";
import {
  IconLayoutColumns,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import React from "react";
import { Book } from "./entity/Book";
import { ColumnFilter } from "./ColumnFilter";
import { bookColumns } from "./bookColumns";
import { bookTableFeatures } from "./bookTable";
import { useBookTableSearchState } from "./useBookTableSearchState";

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
            <Menu.Item onClick={applyUnreadOwnedPreset}>
              Unread owned, order by priority
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button onClick={resetSearch} color="red">
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
