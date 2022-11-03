import { Loader, MultiSelect } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { useAuthorsQuery } from "../../generated/graphql";

export type AuthorsFilterProps<TData, TValue> = { column: Column<TData, TValue> };

export const AuthorsFilter = <TData, TValue>({ column }: AuthorsFilterProps<TData, TValue>): JSX.Element => {
  const [queryResult, _reexecuteQuery] = useAuthorsQuery();

  const fetching = queryResult.fetching || queryResult.data == null;

  if (queryResult.error) {
    return <div>{JSON.stringify(queryResult.error)}</div>;
  }

  return (
    <MultiSelect
      data={queryResult.data?.authors.map((author) => ({
        value: author.id,
        label: author.name,
      })) ?? []}
      searchable
      value={(column.getFilterValue() ?? []) as string[]}
      onChange={(authorIds) => {
        column.setFilterValue(authorIds);
      }}
      rightSection={fetching ? <Loader size={12} /> : null}
      disabled={fetching}
    />
  );
};
