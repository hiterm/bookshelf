import { Box, Group, Table, ThemeIcon } from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { Column, flexRender } from "@tanstack/react-table";
import React from "react";
import { ColumnFilter } from "./ColumnFilter";
import { Book } from "./entity/Book";
import { BookTable as BookTableInstance, bookTableFeatures } from "./bookTable";

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

type BookTableProps = {
  table: BookTableInstance;
};

export const BookTable: React.FC<BookTableProps> = ({ table }) => (
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
);
