import type {
  BookFormat,
  BookStore,
  ImportBookInput,
} from "../../../generated/graphql-request";
import type { ImportedBook } from "./parseKindleExport";

export type ImportBookSettings = {
  splitAuthorsByComma: boolean;
};

export type BookImportDefaults = {
  store: BookStore;
  format: BookFormat;
  owned: boolean;
  priority: number;
};

export const KINDLE_BOOK_IMPORT_DEFAULTS: BookImportDefaults = {
  store: "KINDLE",
  format: "E_BOOK",
  owned: true,
  priority: 50,
};

export const toAuthorNames = (
  authorText: string,
  splitAuthorsByComma: boolean,
): string[] => {
  const authorNames = (
    splitAuthorsByComma ? authorText.split(",") : [authorText]
  )
    .map((author) => author.trim())
    .filter((author) => author !== "");
  if (authorNames.length === 0) {
    throw new Error("著者名が空です");
  }
  return authorNames;
};

export const toImportBookInput = (
  book: ImportedBook,
  bookSettings: ImportBookSettings,
  commonSettings: BookImportDefaults,
): ImportBookInput => ({
  title: book.title,
  authorNames: toAuthorNames(book.authorText, bookSettings.splitAuthorsByComma),
  isbn: "",
  read: book.read,
  owned: commonSettings.owned,
  priority: commonSettings.priority,
  format: commonSettings.format,
  store: commonSettings.store,
  purchaseDate: [
    book.purchasedAt.getFullYear(),
    String(book.purchasedAt.getMonth() + 1).padStart(2, "0"),
    String(book.purchasedAt.getDate()).padStart(2, "0"),
  ].join("-"),
});
