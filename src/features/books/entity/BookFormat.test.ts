import { displayBookFormat } from "./BookFormat";

describe("displayBookFormat", () => {
  test('returns "eBook" for E_BOOK', () => {
    expect(displayBookFormat("E_BOOK")).toBe("eBook");
  });

  test('returns "Printed" for PRINTED', () => {
    expect(displayBookFormat("PRINTED")).toBe("Printed");
  });

  test('returns "Unknown" for UNKNOWN', () => {
    expect(displayBookFormat("UNKNOWN")).toBe("Unknown");
  });
});
