import { describe, expect, test } from "vitest";
import { bookSearchSchema } from "./bookSearch";

describe("bookSearchSchema", () => {
  test("accepts column filters exposed by the table", () => {
    const columnFilters = [
      { id: "title", value: "TypeScript" },
      { id: "authors", value: ["author-1", "author-2"] },
      { id: "isbn", value: "978" },
      { id: "format", value: "E_BOOK" },
      { id: "store", value: "KINDLE" },
      { id: "read", value: false },
      { id: "owned", value: true },
    ];

    expect(bookSearchSchema.parse({ columnFilters })).toEqual({
      columnFilters,
    });
  });

  test.each([
    { id: "unknown", value: "anything" },
    { id: "title", value: { unexpected: true } },
    { id: "authors", value: "author-1" },
    { id: "format", value: "HARDCOVER" },
    { id: "store", value: "OTHER" },
    { id: "read", value: "false" },
    { id: "owned", value: 1 },
  ])("rejects invalid column filter $id=$value", (columnFilter) => {
    expect(() =>
      bookSearchSchema.parse({ columnFilters: [columnFilter] }),
    ).toThrow();
  });

  test("accepts sorting for sortable columns", () => {
    const sorting = [
      { id: "priority", desc: true },
      { id: "createdAt", desc: false },
    ];

    expect(bookSearchSchema.parse({ sorting })).toEqual({ sorting });
  });

  test.each([
    { id: "unknown", desc: false },
    { id: 1, desc: false },
    { id: "priority", desc: "true" },
    { id: "priority" },
  ])("rejects invalid sorting $id=$desc", (sorting) => {
    expect(() => bookSearchSchema.parse({ sorting: [sorting] })).toThrow();
  });

  test.each([20, 50, 100])("accepts supported page size %i", (pageSize) => {
    expect(bookSearchSchema.parse({ pageIndex: 0, pageSize })).toEqual({
      pageIndex: 0,
      pageSize,
    });
  });

  test.each([
    0, 10, 20.5, 200,
  ])("rejects unsupported page size %s", (pageSize) => {
    expect(() => bookSearchSchema.parse({ pageSize })).toThrow();
  });

  test.each([-1, 0.5])("rejects invalid page index %s", (pageIndex) => {
    expect(() => bookSearchSchema.parse({ pageIndex })).toThrow();
  });

  test("accepts a positive integer page index", () => {
    expect(bookSearchSchema.parse({ pageIndex: 1 })).toEqual({ pageIndex: 1 });
  });
});
