import { expect, test } from "vitest";
import { MockStore } from "./mockStore";

test("bulk and merge mutations persist retrievable operations", () => {
  const store = new MockStore();
  const merged = store.mergeAuthor("author-1", "author-2");
  const imported = store.importBooks([
    {
      title: "履歴確認書籍",
      authorNames: ["履歴確認著者"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK",
      store: "KINDLE",
    },
  ]);

  expect(store.getOperation(merged?.operationId ?? "")?.type).toBe(
    "merge_author",
  );
  expect(store.getOperation(imported.operationId)?.type).toBe("import_books");
  expect(store.getOperations()).toContainEqual(
    store.getOperation(imported.operationId),
  );
});

test("restore applies a revision and persists the new operation", () => {
  const store = new MockStore();
  store.updateBook({ id: "book-1", title: "更新タイトル" });

  const restored = store.restoreBook("book-1", 1);

  expect(restored?.book.title).toBe("テスト書籍1");
  expect(restored?.revisionNumber).toBe(3);
  expect(store.getOperation(restored?.operationId ?? "")).toMatchObject({
    type: "restore_book",
    bookChanges: [
      {
        beforeRevision: { revisionNumber: 2 },
        afterRevision: { revisionNumber: 3 },
      },
    ],
  });
  expect(store.restoreBook("book-1", 99)).toBeNull();
});
