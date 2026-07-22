import { describe, expect, test } from "vitest";
import { displayAuthorYomis } from "./displayAuthorYomis";

describe("displayAuthorYomis", () => {
  test("displays a single author reading", () => {
    expect(displayAuthorYomis([{ yomi: "やまだたろう" }])).toBe("やまだたろう");
  });

  test("displays multiple author readings in order", () => {
    expect(
      displayAuthorYomis([{ yomi: "やまだたろう" }, { yomi: "すずきはなこ" }]),
    ).toBe("やまだたろう, すずきはなこ");
  });

  test("displays missing readings as hyphens", () => {
    expect(
      displayAuthorYomis([
        { yomi: "やまだたろう" },
        { yomi: null },
        { yomi: undefined },
        { yomi: "" },
      ]),
    ).toBe("やまだたろう, -, -, -");
  });

  test("displays an empty string when there are no authors", () => {
    expect(displayAuthorYomis([])).toBe("");
  });
});
