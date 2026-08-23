import { expect, test } from "vitest";
import type { ImportedBook } from "./parseKindleExport";
import { toImportBookInput } from "./toImportBookInput";

test("maps an imported Kindle book to the generated GraphQL input", () => {
  const book: ImportedBook = {
    title: "テスト書籍",
    authorNames: ["著者1, 著者2"],
    purchasedAt: new Date("2026-04-25T00:00:00.000Z"),
    read: true,
    asin: "B0NOTANISBN",
    imageUrl: "https://example.com/cover.jpg",
  };

  expect(toImportBookInput(book)).toEqual({
    title: "テスト書籍",
    authorNames: ["著者1, 著者2"],
    isbn: "",
    read: true,
    owned: true,
    priority: 50,
    format: "E_BOOK",
    store: "KINDLE",
  });
  expect(toImportBookInput(book).isbn).not.toBe(book.asin);
});
