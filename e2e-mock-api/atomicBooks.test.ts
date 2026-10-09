import { expect, test, vi } from "vitest";
import { MockStore } from "./mockStore";
const data = {
  title: "Atomic",
  authorIds: [],
  isbn: "",
  read: false,
  owned: false,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
};
test("conflict rolls back earlier author creation and history", () => {
  const store = new MockStore();
  const authors = store.getAllAuthors();
  const books = store.getAllBooks();
  const history = store.getOperations();
  expect(() =>
    store.createBook({ ...data, newAuthorNames: ["A", "著者1"] }),
  ).toThrow("already in use");
  expect(store.getAllAuthors()).toEqual(authors);
  expect(store.getAllBooks()).toEqual(books);
  expect(store.getOperations()).toEqual(history);
});
test("book failure after author creation restores state", () => {
  const store = new MockStore();
  const authors = store.getAllAuthors();
  const create = store.createBook.bind(store);
  vi.spyOn(store, "createBook").mockImplementation((input) => {
    if (input.newAuthorNames == null) throw new Error("book write failed");
    return create(input);
  });
  expect(() => store.createBook({ ...data, newAuthorNames: ["A"] })).toThrow(
    "book write failed",
  );
  expect(store.getAllAuthors()).toEqual(authors);
});
test("create and update resolve distinct names and existing IDs", () => {
  const store = new MockStore();
  const book = store.createBook({ ...data, newAuthorNames: ["A", "A", "B"] });
  expect(book.authorIds).toHaveLength(2);
  expect(store.getOperations().at(0)?.authorChanges).toHaveLength(2);
  expect(store.getOperations().at(0)?.type).toBe("create_book");
  const updated = store.updateBook({
    id: book.id,
    authorIds: [book.authorIds[0]],
    newAuthorNames: ["C"],
  });
  expect(updated?.authorIds).toHaveLength(2);
  expect(store.getOperations().at(0)?.authorChanges).toHaveLength(1);
  expect(store.getOperations().at(0)?.type).toBe("update_book");
});
