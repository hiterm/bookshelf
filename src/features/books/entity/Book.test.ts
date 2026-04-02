import { graphQlBookToBook } from "./Book";

const baseGraphQLBook = {
  id: "book-1",
  title: "Test Book",
  authors: [{ id: "author-1", name: "Author One" }],
  isbn: "9784000000001",
  read: false,
  owned: true,
  priority: 50,
  format: "PRINTED" as const,
  store: "KINDLE" as const,
  createdAt: 1000,
  updatedAt: 2000,
};

describe("graphQlBookToBook", () => {
  test("converts createdAt from Unix seconds to Date", () => {
    const book = graphQlBookToBook(baseGraphQLBook);
    expect(book.createdAt).toEqual(new Date(1000 * 1000));
  });

  test("converts updatedAt from Unix seconds to Date", () => {
    const book = graphQlBookToBook(baseGraphQLBook);
    expect(book.updatedAt).toEqual(new Date(1000 * 2000));
  });

  test("does not mutate the input", () => {
    const input = { ...baseGraphQLBook };
    graphQlBookToBook(input);
    expect(input).toEqual(baseGraphQLBook);
  });

  test("preserves other fields unchanged", () => {
    const book = graphQlBookToBook(baseGraphQLBook);
    expect(book.id).toBe("book-1");
    expect(book.title).toBe("Test Book");
    expect(book.authors).toEqual([{ id: "author-1", name: "Author One" }]);
    expect(book.isbn).toBe("9784000000001");
    expect(book.read).toBe(false);
    expect(book.owned).toBe(true);
    expect(book.priority).toBe(50);
    expect(book.format).toBe("PRINTED");
    expect(book.store).toBe("KINDLE");
  });
});
