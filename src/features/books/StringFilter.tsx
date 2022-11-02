import { TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";

export type StringFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const StringFilter = <TData, TValue>({ column }: StringFilterProps<TData, TValue>) => {
  const [value, setValue] = useState<string>((column.getFilterValue() ?? "") as string);
  const [debouncedValue] = useDebouncedValue(value, 1000);

  useEffect(() => {
    column.setFilterValue(debouncedValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <TextInput
      value={value}
      onChange={event => setValue(event.target.value)}
    />
  );
};
