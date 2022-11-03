import { Column, Table as ReactTable } from "@tanstack/react-table";
import { AuthorsFilter } from "./AuthorsFilter";
import { BooleanFilter } from "./BooleanFilter";
import { FormatFilter } from "./FormatFilter";
import { StoreFilter } from "./StoreFilter";
import { StringFilter } from "./StringFilter";

type FilterProps<TData, TValue> = { column: Column<TData, TValue>; table: ReactTable<TData> };

export const Filter = <TData, TValue>({ column }: FilterProps<TData, TValue>): JSX.Element => {
  switch (column.columnDef.meta?.filterType) {
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
};
