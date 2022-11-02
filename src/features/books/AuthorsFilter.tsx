import { Loader, MultiSelect } from "@mantine/core";
import { useAuthorsQuery } from "../../generated/graphql";

export type AuthorsFilterProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const AuthorsFilter: React.FC<AuthorsFilterProps> = ({ value, onChange }) => {
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
