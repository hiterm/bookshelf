import { expect, test } from "vitest";
import { MockStore } from "./mockStore";

test("book import preview resolves authors without mutating state", () => {
  const mockStore = new MockStore();
  const booksBefore = mockStore.getAllBooks();
  const authorsBefore = mockStore.getAllAuthors();

  const result = mockStore.previewBookImport([
    {
      title: "プレビュー書籍",
      authorNames: ["著者1", "プレビュー新規著者", "プレビュー新規著者"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK",
      store: "KINDLE",
    },
  ]);

  expect(result.books[0]?.authors).toEqual([
    { name: "著者1", status: "EXISTING" },
    { name: "プレビュー新規著者", status: "NEW" },
  ]);
  expect(mockStore.getAllBooks()).toEqual(booksBefore);
  expect(mockStore.getAllAuthors()).toEqual(authorsBefore);
});

test("bulk import revisions share the returned operation", () => {
  const mockStore = new MockStore();
  const result = mockStore.importBooks([
    {
      title: "操作確認書籍",
      authorNames: ["操作確認著者"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK",
      store: "KINDLE",
    },
  ]);

  const author = mockStore
    .getAllAuthors()
    .find(({ name }) => name === "操作確認著者");
  expect(author).toBeDefined();
  expect(
    mockStore.getOperation(result.operationId)?.authorChanges[0]?.authorId,
  ).toBe(author?.id);
  expect(
    mockStore.getOperation(result.operationId)?.bookChanges[0]?.bookId,
  ).toBe(result.books[0].id);
});

test("bulk import removes duplicate authors from a book", () => {
  const mockStore = new MockStore();
  const result = mockStore.importBooks([
    {
      title: "重複著者確認書籍",
      authorNames: ["重複著者", "重複著者"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK",
      store: "KINDLE",
    },
  ]);

  const importedBook = result.books[0];
  expect(importedBook.authorIds).toHaveLength(1);
  expect(mockStore.getAuthor(importedBook.authorIds[0])?.name).toBe("重複著者");
});

test("single-book import with an existing author keeps import operation", () => {
  const mockStore = new MockStore();
  const result = mockStore.importBooks([
    {
      title: "単一インポート書籍",
      authorNames: ["著者1"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK",
      store: "KINDLE",
    },
  ]);

  expect(mockStore.getOperation(result.operationId)?.type).toBe("import_books");
});
