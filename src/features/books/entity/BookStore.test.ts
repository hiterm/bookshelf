import { displayBookStore } from "./BookStore";

describe("displayBookStore", () => {
  test('returns "Kindle" for KINDLE', () => {
    expect(displayBookStore("KINDLE")).toBe("Kindle");
  });

  test('returns "Unknown" for UNKNOWN', () => {
    expect(displayBookStore("UNKNOWN")).toBe("Unknown");
  });
});
