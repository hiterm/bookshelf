import { Loader, MultiSelect } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { useAuthors } from "../../compoments/hooks/useAuthors";

export type AuthorsFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export const AuthorsFilter = <TData, TValue>({
  column,
}: AuthorsFilterProps<TData, TValue>): React.JSX.Element => {
  const { data, isLoading, error } = useAuthors();

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <MultiSelect
      data={
        data?.authors.map((author) => ({
          value: author.id,
          label: author.name,
        })) ?? []
      }
      searchable
      value={(column.getFilterValue() ?? []) as string[]}
      onChange={(authorIds) => {
        column.setFilterValue(authorIds);
      }}
      rightSection={isLoading ? <Loader size={12} /> : null}
      disabled={isLoading}
    />
  );
};
