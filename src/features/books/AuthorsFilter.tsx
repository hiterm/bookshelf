import { LocalError } from "../../components/errors/LocalError";
import { Loader, MultiSelect } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { useAuthors } from "../authors/api/useAuthors";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";

export type AuthorsFilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const AuthorsFilter = ({
  column,
}: AuthorsFilterProps): React.JSX.Element => {
  const { data, isLoading, error } = useAuthors();
  const filterValue = column.getFilterValue();
  const selectedIds = Array.isArray(filterValue)
    ? filterValue.filter((x): x is string => typeof x === "string")
    : [];

  if (error != null) {
    return (
      <LocalError
        error={error}
        title="An error occurred while loading authors"
      />
    );
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
      value={selectedIds}
      onChange={(authorIds) => {
        column.setFilterValue(authorIds);
      }}
      rightSection={isLoading ? <Loader size={12} /> : null}
      disabled={isLoading}
    />
  );
};
