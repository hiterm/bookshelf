import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";

export type FormatFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export const FormatFilter = <TData, TValue>({
  column,
}: FormatFilterProps<TData, TValue>): React.JSX.Element => {
  const filterValue = column.getFilterValue();
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_FORMAT_VALUE.map((format) => ({
          value: format,
          label: displayBookFormat(format),
        })),
      ]}
      value={typeof filterValue === "string" ? filterValue : ""}
      onChange={(value) => {
        column.setFilterValue(value);
      }}
    />
  );
};
