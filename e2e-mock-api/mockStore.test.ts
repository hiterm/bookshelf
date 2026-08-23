import { expect, test } from "vitest";
import { MockStore } from "./mockStore";

test("bulk import events share the returned event set", () => {
  const mockStore = new MockStore();
  const result = mockStore.importBooks([
    {
      title: "イベントセット確認書籍",
      authorNames: ["イベントセット確認著者"],
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
    .find(({ name }) => name === "イベントセット確認著者");
  expect(author).toBeDefined();
  expect(
    mockStore
      .getAuthorEvents(author?.id ?? "")
      .map(({ eventSetId }) => eventSetId),
  ).toEqual([result.eventSetId]);
  expect(
    mockStore
      .getBookEvents(result.books[0].id)
      .map(({ eventSetId }) => eventSetId),
  ).toEqual([result.eventSetId]);
});
