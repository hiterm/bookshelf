import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";

export type FormatFilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const FormatFilter = ({
  column,
}: FormatFilterProps): React.JSX.Element => {
  const filterValue = column.getFilterValue();
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_FORMAT_VALUE.map((format) => ({
          value: format,
          label: displayBookFormat(format),
        })),
      ]}
      value={typeof filterValue === "string" ? filterValue : ""}
      onChange={(value) => {
        column.setFilterValue(value);
      }}
    />
  );
};
