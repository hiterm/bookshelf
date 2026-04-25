import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

export type StoreFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const StoreFilter = <TData, TValue>({
  column,
}: StoreFilterProps<TData, TValue>): React.JSX.Element => {
  const filterValue = column.getFilterValue();
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_STORE_VALUE.map((format) => ({
          value: format,
          label: displayBookStore(format),
        })),
      ]}
      value={typeof filterValue === "string" ? filterValue : ""}
      onChange={(value) => {
        column.setFilterValue(value);
      }}
    />
  );
};
