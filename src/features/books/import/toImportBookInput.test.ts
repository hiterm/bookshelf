import { describe, expect, test } from "vitest";
import type { ImportedBook } from "./parseKindleExport";
import {
  KINDLE_BOOK_IMPORT_DEFAULTS,
  toAuthorNames,
  toImportBookInput,
} from "./toImportBookInput";

const book: ImportedBook = {
  title: "テスト書籍",
  authorText: "著者1, 著者2",
  purchasedAt: new Date("2026-04-25T00:00:00.000Z"),
  read: true,
  asin: "B0NOTANISBN",
  imageUrl: "https://example.com/cover.jpg",
};

describe("toAuthorNames", () => {
  test("keeps a comma-containing name together when splitting is off", () => {
    expect(toAuthorNames("Smith, John", false)).toEqual(["Smith, John"]);
  });

  test("splits, trims, and removes empty segments without mutation", () => {
    const authorText = " 山田太郎, , 鈴木花子, ";
    expect(toAuthorNames(authorText, true)).toEqual(["山田太郎", "鈴木花子"]);
    expect(authorText).toBe(" 山田太郎, , 鈴木花子, ");
  });

  test("rejects author text that produces no names", () => {
    expect(() => toAuthorNames(" , ", true)).toThrow("著者名が空です");
  });
});

test("maps per-book and common settings to the generated GraphQL input", () => {
  expect(
    toImportBookInput(
      book,
      { splitAuthorsByComma: true },
      {
        store: "UNKNOWN",
        format: "PRINTED",
        owned: false,
        priority: 75,
      },
    ),
  ).toEqual({
    title: "テスト書籍",
    authorNames: ["著者1", "著者2"],
    isbn: "",
    read: true,
    owned: false,
    priority: 75,
    format: "PRINTED",
    store: "UNKNOWN",
  });
});

test("keeps current Kindle behavior in one default object", () => {
  expect(KINDLE_BOOK_IMPORT_DEFAULTS).toEqual({
    store: "KINDLE",
    format: "E_BOOK",
    owned: true,
    priority: 50,
  });
  expect(
    toImportBookInput(
      book,
      { splitAuthorsByComma: false },
      KINDLE_BOOK_IMPORT_DEFAULTS,
    ),
  ).toMatchObject({
    authorNames: ["著者1, 著者2"],
    isbn: "",
    owned: true,
    priority: 50,
    format: "E_BOOK",
    store: "KINDLE",
  });
});
