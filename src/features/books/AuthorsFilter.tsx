import { Loader, MultiSelect } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { Author } from "./entity/Author";

export type AuthorsFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  authors: Author[];
};

export const AuthorsFilter = <TData, TValue>({
  column,
  authors,
}: AuthorsFilterProps<TData, TValue>): React.JSX.Element => {
  return (
    <MultiSelect
      data={authors.map((author) => ({
        value: author.id,
        label: author.name,
      }))}
      searchable
      value={(column.getFilterValue() ?? []) as string[]}
      onChange={(authorIds) => {
        column.setFilterValue(authorIds);
      }}
    />
  );
};
