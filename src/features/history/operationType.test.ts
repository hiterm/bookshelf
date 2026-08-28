import { expect, test } from "vitest";
import { displayOperationType } from "./operationType";

test("translates known operation types and falls back", () => {
  expect(displayOperationType("create_book")).toBe("書籍を追加");
  expect(displayOperationType("merge_author")).toBe("著者を統合");
  expect(displayOperationType("future_operation")).toBe("future_operation");
});
