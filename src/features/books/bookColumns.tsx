import { Box } from "@mantine/core";
import { createColumnHelper, FilterFn } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Link } from "../../components/mantineTsr";
import { BooleanValue } from "../../components/utils/BooleanValue";
import { displayAuthorYomis } from "./displayAuthorYomis";
import { authorSchema } from "./entity/Author";
import { Book } from "./entity/Book";
import { displayBookFormat } from "./entity/BookFormat";
import { displayBookStore } from "./entity/BookStore";
import { bookTableFeatures } from "./bookTable";

const authorsFilter: FilterFn<typeof bookTableFeatures, Book> = (
  row,
  columnId,
  filterValue: string[],
  _addMeta,
) => {
  if (filterValue.length === 0) {
    return true;
  }

  const value = row.getValue(columnId);
  if (!Array.isArray(value)) return false;
  return value.some((item) => {
    const parsed = authorSchema.safeParse(item);
    return parsed.success && filterValue.includes(parsed.data.id);
  });
};

const formatDate = (date: Date) => dayjs(date).format("YYYY/MM/DD HH:mm Z");

const columnHelper = createColumnHelper<typeof bookTableFeatures, Book>();

export const bookColumns = columnHelper.columns([
  columnHelper.accessor("title", {
    header: "書名",
    cell: (info) => (
      <Link to={`/books/$id`} params={{ id: info.row.original.id }}>
        {info.getValue()}
      </Link>
    ),
    filterFn: "includesString",
    meta: { filterType: "string" },
    minSize: 200,
  }),
  columnHelper.accessor("authors", {
    header: "著者",
    cell: (info) =>
      info
        .getValue()
        .map((author) => author.name)
        .join(", "),
    meta: { filterType: "authors" },
    filterFn: authorsFilter,
    minSize: 200,
  }),
  columnHelper.accessor((book) => displayAuthorYomis(book.authors), {
    id: "authorYomis",
    header: "著者読み仮名",
    filterFn: "includesString",
    meta: { filterType: "string" },
    minSize: 200,
  }),
  columnHelper.accessor("isbn", {
    header: "ISBN",
    filterFn: "includesString",
    meta: { filterType: "string" },
  }),
  columnHelper.accessor("format", {
    header: "形式",
    cell: (info) => displayBookFormat(info.getValue()),
    filterFn: "equalsString",
    meta: { filterType: "format" },
    minSize: 120,
  }),
  columnHelper.accessor("store", {
    header: "ストア",
    cell: (info) => displayBookStore(info.getValue()),
    filterFn: "equalsString",
    meta: { filterType: "store" },
    minSize: 120,
  }),
  columnHelper.accessor("priority", { header: "優先度", filterFn: "equals" }),
  columnHelper.accessor("read", {
    header: "既読",
    cell: (info) => <BooleanValue flag={info.getValue()} />,
    filterFn: "equals",
    meta: { filterType: "boolean" },
    minSize: 100,
  }),
  columnHelper.accessor("owned", {
    header: "所有",
    cell: (info) => <BooleanValue flag={info.getValue()} />,
    filterFn: "equals",
    meta: { filterType: "boolean" },
    minSize: 100,
  }),
  columnHelper.accessor("createdAt", {
    header: "追加日時",
    cell: (info) => (
      <Box style={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: "更新日時",
    cell: (info) => (
      <Box style={{ whiteSpace: "nowrap" }}>{formatDate(info.getValue())}</Box>
    ),
  }),
]);
