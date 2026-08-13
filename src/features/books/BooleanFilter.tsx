import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";

export type BooleanFilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const BooleanFilter = ({
  column,
}: BooleanFilterProps): React.JSX.Element => {
  return (
    <Select
      data={["-", "true", "false"]}
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      value={String(column.getFilterValue() ?? "-")}
      onChange={(value) => {
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
};
