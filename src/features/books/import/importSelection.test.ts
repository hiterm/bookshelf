import { expect, test } from "vitest";
import { updateVisibleSelection } from "./importSelection";

test("visible bulk selection preserves hidden selections and its source", () => {
  const selected = new Set([0, 2]);

  expect(updateVisibleSelection(selected, [1, 2], false)).toEqual(new Set([0]));
  expect(updateVisibleSelection(selected, [1], true)).toEqual(
    new Set([0, 1, 2]),
  );
  expect(selected).toEqual(new Set([0, 2]));
});
