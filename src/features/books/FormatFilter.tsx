import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";

export type FormatFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const FormatFilter = <TData, TValue>({ column }: FormatFilterProps<TData, TValue>): JSX.Element => {
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_FORMAT_VALUE.map((format) => ({
          value: format,
          label: displayBookFormat(format),
        })),
      ]}
      value={column.getFilterValue() as (string | undefined) ?? ""}
      onChange={value => column.setFilterValue(value)}
    />
  );
};
