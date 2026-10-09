import { setupServer } from "msw/node";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { z } from "zod";
import type { MockStore } from "./mockStore";

let server: ReturnType<typeof setupServer>;
let store: MockStore;

beforeEach(async () => {
  vi.resetModules();
  const { handlers } = await import("./handlers");
  const { mockStore } = await import("./mockStore");
  store = mockStore;
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.close();
});

const data = {
  title: "HTTP atomic book",
  authorIds: [],
  isbn: "",
  read: false,
  owned: false,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
};

const responseSchema = z.object({
  data: z
    .record(
      z.string(),
      z.object({
        book: z.object({
          id: z.string(),
          authors: z.array(z.object({ name: z.string() })),
        }),
      }),
    )
    .optional(),
  errors: z
    .array(z.object({ extensions: z.record(z.string(), z.unknown()) }))
    .optional(),
});

async function save(
  mode: "create" | "update",
  bookData: unknown,
): Promise<{
  data?: Record<string, { book: { id: string; authors: { name: string }[] } }>;
  errors?: { extensions: Record<string, unknown> }[];
}> {
  const operation = `${mode}Book`;
  const response = await fetch("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation ${operation}($bookData: ${mode === "create" ? "Create" : "Update"}BookInput!) { ${operation}(bookData: $bookData) { book { id authors { name } } } }`,
      variables: { bookData },
    }),
  });
  expect(response.status).toBe(200);
  const result: unknown = await response.json();
  return responseSchema.parse(result);
}

for (const mode of ["create", "update"] as const) {
  test(`${mode} returns the typed conflict over HTTP and rolls back all changes`, async () => {
    const before = {
      authors: store.getAllAuthors(),
      books: store.getAllBooks(),
      operations: store.getOperations(),
    };
    const result = await save(mode, {
      ...data,
      ...(mode === "update" ? { id: "book-1" } : {}),
      newAuthorNames: ["A", "著者1"],
    });
    expect(result.data).toBeUndefined();
    expect(result.errors?.[0].extensions).toEqual({
      code: "CONFLICT",
      reason: "AUTHOR_NAME_CONFLICT",
    });
    expect(store.getAllAuthors()).toEqual(before.authors);
    expect(store.getAllBooks()).toEqual(before.books);
    expect(store.getOperations()).toEqual(before.operations);
  });

  test(`${mode} saves new authors over HTTP and accepts legacy input`, async () => {
    const result = await save(mode, {
      ...data,
      ...(mode === "update" ? { id: "book-1" } : {}),
      newAuthorNames: ["New A", "New B"],
    });
    expect(result.errors).toBeUndefined();
    expect(
      result.data?.[`${mode}Book`].book.authors.map((a) => a.name),
    ).toEqual(["New A", "New B"]);
    expect(store.getOperations()[0].authorChanges).toHaveLength(2);
    const legacy = await save(mode, {
      ...data,
      ...(mode === "update" ? { id: "book-1" } : {}),
    });
    expect(legacy.errors).toBeUndefined();
    expect(legacy.data?.[`${mode}Book`].book.authors).toEqual([]);
  });

  test(`${mode} rejects invalid new author input without changing stored data`, async () => {
    const before = store.getAllBooks();
    const result = await save(mode, {
      ...data,
      ...(mode === "update" ? { id: "book-1" } : {}),
      newAuthorNames: [42],
    });
    expect(result.errors?.[0].extensions.code).toBe("VALIDATION_ERROR");
    expect(store.getAllBooks()).toEqual(before);
  });
}
