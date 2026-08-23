import { describe, expect, test } from "vitest";
import {
  displayEventOperation,
  displayEventSetOperation,
} from "./eventSetOperation";

describe("history operation labels", () => {
  test("translates known EventSet operations", () => {
    expect(displayEventSetOperation("create_book")).toBe("書籍を追加");
    expect(displayEventSetOperation("merge_author")).toBe("著者を統合");
    expect(displayEventSetOperation("import_books")).toBe("書籍をインポート");
  });

  test("falls back to unknown operation values", () => {
    expect(displayEventSetOperation("future_operation")).toBe(
      "future_operation",
    );
    expect(displayEventOperation("FUTURE_EVENT")).toBe("FUTURE_EVENT");
  });
});
