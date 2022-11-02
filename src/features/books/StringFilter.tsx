import { TextInput } from "@mantine/core";
import { Column } from "@tanstack/react-table";

export type StringFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const StringFilter = <TData, TValue>({ column }: StringFilterProps<TData, TValue>) => {
  return (
    <TextInput
      value={column.getFilterValue() as string ?? ""}
      onChange={event => column.setFilterValue(event.target.value)}
    />
  );
};
