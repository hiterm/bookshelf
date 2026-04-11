import { TextInput } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDebouncedEffect } from "../../compoments/hooks/useDebouncedEffect";

export type StringFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export const StringFilter = <TData, TValue>({
  column,
}: StringFilterProps<TData, TValue>) => {
  const [value, setValue] = useState((column.getFilterValue() ?? "") as string);

  useDebouncedEffect(
    () => {
      column.setFilterValue(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
    1000,
  );

  const filterValue = column.getFilterValue();
  useEffect(() => {
    setValue((filterValue as string | undefined) ?? "");
  }, [filterValue]);

  return (
    <TextInput
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
};
