import { Loader, MultiSelect, Select, TextInput } from "@mantine/core";
import { Column, Table as ReactTable } from "@tanstack/react-table";
import { useAuthorsQuery } from "../../generated/graphql";
import { BOOK_FORMAT_VALUE, BOOK_STORE_VALUE, displayBookFormat, displayBookStore } from "./schema";

type AuthorsFilterProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const AuthorsFilter: React.FC<AuthorsFilterProps> = ({ value, onChange }) => {
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
      value={value}
      onChange={(authorIds) => {
        onChange(authorIds);
      }}
      rightSection={fetching ? <Loader size={12} /> : null}
      disabled={fetching}
    />
  );
};

type FilterProps = { column: Column<any, unknown>; table: ReactTable<any> };

export const Filter: React.FC<FilterProps> = ({ column }) => {
  switch (column.columnDef.meta?.filterType) {
    case "string":
      return (
        <TextInput
          value={column.getFilterValue() as string ?? ""}
          onChange={event => column.setFilterValue(event.target.value)}
        />
      );
    case "boolean":
      return (
        <Select
          data={["-", "true", "false"]}
          value={String(column.getFilterValue() ?? "-")}
          onChange={value => {
            if (value === "true") {
              column.setFilterValue(true);
            } else if (value === "false") {
              column.setFilterValue(false);
            } else if (value === "-") {
              column.setFilterValue(undefined);
            }
          }}
        />
      );
    case "format":
      return (
        <Select
          data={[
            { value: "", label: "-" },
            ...BOOK_FORMAT_VALUE.map((format) => ({
              value: format,
              label: displayBookFormat(format),
            })),
          ]}
          value={column.getFilterValue() as string ?? ""}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "store":
      return (
        <Select
          data={[
            { value: "", label: "-" },
            ...BOOK_STORE_VALUE.map((format) => ({
              value: format,
              label: displayBookStore(format),
            })),
          ]}
          value={column.getFilterValue() as string ?? ""}
          onChange={value => column.setFilterValue(value)}
        />
      );
    case "authors":
      return (
        <AuthorsFilter
          value={(column.getFilterValue() ?? []) as string[]}
          onChange={column.setFilterValue}
        />
      );
    default:
      return <></>;
  }
};
