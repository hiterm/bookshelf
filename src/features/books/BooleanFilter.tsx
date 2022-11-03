import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";

export type BooleanFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const BooleanFilter = <TData, TValue>({ column }: BooleanFilterProps<TData, TValue>): JSX.Element => {
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
};
