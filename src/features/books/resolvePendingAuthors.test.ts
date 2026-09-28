import { describe, expect, test, vi } from "vitest";
import { resolvePendingAuthors } from "./resolvePendingAuthors";

describe("resolvePendingAuthors", () => {
  test("returns non-pending authors unchanged", async () => {
    const createAuthor = vi.fn();
    const authors = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];

    const result = await resolvePendingAuthors(authors, createAuthor);

    expect(result).toEqual(authors);
    expect(createAuthor).not.toHaveBeenCalled();
  });

  test("resolves a pending author via createAuthor", async () => {
    const createAuthor = vi.fn().mockResolvedValue("new-id-1");
    const authors = [{ id: "__pending__:Alice", name: "Alice" }];

    const result = await resolvePendingAuthors(authors, createAuthor);

    expect(createAuthor).toHaveBeenCalledWith("Alice");
    expect(result).toEqual([{ id: "new-id-1", name: "Alice" }]);
  });

  test("deduplicates pending authors with the same name", async () => {
    const createAuthor = vi.fn().mockResolvedValue("new-id-1");
    const authors = [
      { id: "__pending__:Alice", name: "Alice" },
      { id: "__pending__:Alice", name: "Alice" },
    ];

    const result = await resolvePendingAuthors(authors, createAuthor);

    expect(createAuthor).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: "new-id-1", name: "Alice" },
      { id: "new-id-1", name: "Alice" },
    ]);
  });

  test("resolves mixed real and pending authors", async () => {
    const createAuthor = vi.fn().mockResolvedValue("new-id-2");
    const authors = [
      { id: "1", name: "Bob" },
      { id: "__pending__:Alice", name: "Alice" },
    ];

    const result = await resolvePendingAuthors(authors, createAuthor);

    expect(createAuthor).toHaveBeenCalledWith("Alice");
    expect(result).toEqual([
      { id: "1", name: "Bob" },
      { id: "new-id-2", name: "Alice" },
    ]);
  });
});
