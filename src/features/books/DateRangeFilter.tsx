import { Group, TextInput } from "@mantine/core";
import type { Column } from "@tanstack/react-table";
import { bookTableFeatures } from "./bookTable";
import type { Book } from "./entity/Book";

export type DateRangeFilterValue = { from?: string; to?: string };

export const DateRangeFilter = ({
  column,
}: {
  column: Column<typeof bookTableFeatures, Book>;
}) => {
  const value = (column.getFilterValue() ?? {}) as DateRangeFilterValue;
  const update = (key: keyof DateRangeFilterValue, next: string) => {
    const range = { ...value, [key]: next === "" ? undefined : next };
    column.setFilterValue(
      range.from == null && range.to == null ? undefined : range,
    );
  };

  return (
    <Group gap="xs" wrap="nowrap">
      <TextInput
        type="date"
        aria-label="購入日 From"
        value={value.from ?? ""}
        onChange={(event) => {
          update("from", event.currentTarget.value);
        }}
      />
      <TextInput
        type="date"
        aria-label="購入日 To"
        value={value.to ?? ""}
        onChange={(event) => {
          update("to", event.currentTarget.value);
        }}
      />
    </Group>
  );
};
