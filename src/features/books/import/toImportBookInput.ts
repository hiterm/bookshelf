import type { ImportBookInput } from "../../../generated/graphql-request";
import type { ImportedBook } from "./parseKindleExport";

export const toImportBookInput = (book: ImportedBook): ImportBookInput => ({
  title: book.title,
  authorNames: book.authorNames,
  isbn: "",
  read: book.read,
  owned: true,
  priority: 50,
  format: "E_BOOK",
  store: "KINDLE",
});
