import { Select } from "@mantine/core";
import { Column, Table as ReactTable } from "@tanstack/react-table";
import { AuthorsFilter } from "./AuthorsFilter";
import { BOOK_FORMAT_VALUE, BOOK_STORE_VALUE, displayBookFormat, displayBookStore } from "./schema";
import { StringFilter } from "./StringFilter";

type FilterProps<TData, TValue> = { column: Column<TData, TValue>; table: ReactTable<TData> };

export const Filter = <TData, TValue>({ column }: FilterProps<TData, TValue>): JSX.Element => {
  switch (column.columnDef.meta?.filterType) {
    case "string":
      return <StringFilter column={column} />;
    case "boolean":
      return (
        <Select
          data={["-", "true", "false"]}
          value={String(column.getFilterValue() ?? "-")}
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
          data={[
            { value: "", label: "-" },
            ...BOOK_FORMAT_VALUE.map((format) => ({
              value: format,
              label: displayBookFormat(format),
            })),
          ]}
          value={column.getFilterValue() as string ?? ""}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "store":
      return (
        <Select
          data={[
            { value: "", label: "-" },
            ...BOOK_STORE_VALUE.map((format) => ({
              value: format,
              label: displayBookStore(format),
            })),
          ]}
          value={column.getFilterValue() as string ?? ""}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "authors":
      return (
        <AuthorsFilter
          value={(column.getFilterValue() ?? []) as string[]}
          onChange={column.setFilterValue}
        />
      );
    default:
      return <></>;
  }
};
