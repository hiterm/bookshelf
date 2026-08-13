import { describe, expect, test } from "vitest";
import { bookSearchSchema } from "./bookSearch";

describe("bookSearchSchema", () => {
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
});
