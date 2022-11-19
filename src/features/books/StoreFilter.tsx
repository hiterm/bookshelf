import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

export type StoreFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const StoreFilter = <TData, TValue>({ column }: StoreFilterProps<TData, TValue>): JSX.Element => {
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_STORE_VALUE.map((format) => ({
          value: format,
          label: displayBookStore(format),
        })),
      ]}
      value={column.getFilterValue() as (string | undefined) ?? ""}
      onChange={value => column.setFilterValue(value)}
    />
  );
};
