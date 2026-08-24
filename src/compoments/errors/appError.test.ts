import { ClientError } from "graphql-request";
import { GraphQLError } from "graphql";
import {
  formatErrorForClipboard,
  normalizeError,
  type AppError,
} from "./appError";

describe("normalizeError", () => {
  it("normalizes Error with its stack", () => {
    const error = new Error("broken");
    const normalized = normalizeError(error);
    expect(normalized.message).toBe("broken");
    expect(normalized.details).toContain("Error: broken");
  });

  it("normalizes a ClientError without request secrets", () => {
    const error = new ClientError(
      {
        status: 403,
        headers: new Headers(),
        body: "",
        errors: [
          new GraphQLError("Forbidden", {
            extensions: {
              code: "FORBIDDEN",
              accessToken: "response-secret",
              authorization: "Bearer header-secret",
            },
          }),
        ],
      },
      {
        query: "mutation UpdateBook { updateBook { id } }",
        variables: { accessToken: "variable-secret" },
      },
    );

    const normalized = normalizeError(error);
    expect(normalized.message).toBe("Forbidden");
    expect(normalized.details).toContain('"httpStatus": 403');
    expect(normalized.details).toContain('"code": "FORBIDDEN"');
    expect(normalized.details).not.toMatch(
      /response-secret|variable-secret|header-secret|authorization|variables/i,
    );
  });

  it.each([
    ["plain failure", { message: "plain failure" }],
    [
      { reason: "not safe to serialize" },
      { message: "不明なエラーが発生しました" },
    ],
    [null, { message: "不明なエラーが発生しました" }],
    [undefined, { message: "不明なエラーが発生しました" }],
  ])("normalizes %p", (input, expected) => {
    expect(normalizeError(input)).toEqual(expected);
  });
});

describe("formatErrorForClipboard", () => {
  it("formats all issue-ready fields", () => {
    const error: AppError = {
      id: "error-1",
      title: "書籍の更新に失敗しました",
      operation: "UpdateBook",
      message: "Forbidden",
      details: "technical details",
      occurredAt: new Date("2026-08-24T01:23:45.000Z"),
    };

    expect(formatErrorForClipboard(error)).toBe(
      [
        "Title: 書籍の更新に失敗しました",
        "Operation: UpdateBook",
        "Message: Forbidden",
        "Details:",
        "technical details",
        "Occurred at: 2026-08-24T01:23:45.000Z",
      ].join("\n"),
    );
  });

  it("omits optional fields when absent", () => {
    expect(
      formatErrorForClipboard({
        id: "error-1",
        title: "失敗しました",
        message: "unknown",
        occurredAt: new Date("2026-08-24T01:23:45.000Z"),
      }),
    ).not.toMatch(/Operation|Details/);
  });
});
