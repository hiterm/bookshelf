import { describe, expect, test } from "vitest";
import type { ImportedBook } from "./parseKindleExport";
import { filterImportedBooks } from "./filterImportedBooks";

const bookAt = (title: string, purchasedAt: Date): ImportedBook => ({
  title,
  authorNames: ["著者"],
  purchasedAt,
  read: false,
  asin: title,
});

describe("filterImportedBooks", () => {
  const books = [
    bookAt("前日", new Date(2026, 3, 24, 23, 59, 59)),
    bookAt("当日", new Date(2026, 3, 25, 0, 0, 0)),
    bookAt("翌日", new Date(2026, 3, 26, 12, 0, 0)),
  ];

  test("returns all books when no date is specified", () => {
    const result = filterImportedBooks(books);

    expect(result).toEqual(books);
    expect(result).not.toBe(books);
  });

  test("includes the selected calendar date and later dates", () => {
    expect(
      filterImportedBooks(books, "2026-04-25").map((book) => book.title),
    ).toEqual(["当日", "翌日"]);
  });

  test("does not mutate the source array", () => {
    const snapshot = [...books];

    filterImportedBooks(books, "2026-04-25");

    expect(books).toEqual(snapshot);
  });
});
