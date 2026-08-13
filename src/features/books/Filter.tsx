import { Column } from "@tanstack/react-table";
import { AuthorsFilter } from "./AuthorsFilter";
import { BooleanFilter } from "./BooleanFilter";
import { FormatFilter } from "./FormatFilter";
import { StoreFilter } from "./StoreFilter";
import { StringFilter } from "./StringFilter";
import { bookTableFeatures } from "./bookTable";
import { Book } from "./entity/Book";

type FilterProps = {
  column: Column<typeof bookTableFeatures, Book>;
};

export const Filter = ({ column }: FilterProps): React.JSX.Element => {
  const meta = column.columnDef.meta;
  const filterType =
    meta != null && "filterType" in meta ? meta.filterType : undefined;
  const inner = (() => {
    switch (filterType) {
      case "string":
        return <StringFilter column={column} />;
      case "boolean":
        return <BooleanFilter column={column} />;
      case "format":
        return <FormatFilter column={column} />;
      case "store":
        return <StoreFilter column={column} />;
      case "authors":
        return <AuthorsFilter column={column} />;
      default:
        return <></>;
    }
  })();
  return <div data-testid={`filter-${column.id}`}>{inner}</div>;
};
