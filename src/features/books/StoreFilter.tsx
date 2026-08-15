import { Select } from "@mantine/core";
import { Column } from "@tanstack/react-table";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

export type StoreFilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const StoreFilter = ({
  column,
}: StoreFilterProps): React.JSX.Element => {
  const filterValue = column.getFilterValue();
  return (
    <Select
      data={[
        { value: "", label: "-" },
        ...BOOK_STORE_VALUE.map((format) => ({
          value: format,
          label: displayBookStore(format),
        })),
      ]}
      value={typeof filterValue === "string" ? filterValue : ""}
      onChange={(value) => {
        column.setFilterValue(value);
      }}
    />
  );
};
