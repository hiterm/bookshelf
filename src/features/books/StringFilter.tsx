import { TextInput } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDebouncedEffect } from "../../compoments/hooks/useDebouncedEffect";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";

export type StringFilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const StringFilter = ({ column }: StringFilterProps) => {
  const initial = column.getFilterValue();
  const [value, setValue] = useState(
    typeof initial === "string" ? initial : "",
  );

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
    // Keep the debounced input in sync with externally-driven URL changes,
    // including resets and browser navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(typeof filterValue === "string" ? filterValue : "");
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
