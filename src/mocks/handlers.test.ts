import { expect, test } from "vitest";
import { assignPurchaseDateUpdate } from "./handlers";

test.each([
  { value: undefined, expected: { id: "book-1" } },
  { value: null, expected: { id: "book-1", purchaseDate: null } },
  {
    value: "2024-05-01",
    expected: { id: "book-1", purchaseDate: "2024-05-01" },
  },
])("maps purchase date update value $value", ({ value, expected }) => {
  const update: { id: string; purchaseDate?: string | null } = {
    id: "book-1",
  };

  assignPurchaseDateUpdate(update, value);

  expect(update).toEqual(expected);
});
