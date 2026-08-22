import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Authors READ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("displays author list", async ({ page }) => {
    await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "著者2" })).toBeVisible();
    await expect(
      page.locator("td").filter({ hasText: "ちょしゃいち" }),
    ).toBeVisible();
  });

  test("search functionality works", async ({ page }) => {
    const searchInput = page.getByPlaceholder("検索...");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("著者1");
    await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
    await expect(
      page.locator("td").filter({ hasText: "著者2" }),
    ).not.toBeVisible();
  });

  test("searches authors by reading", async ({ page }) => {
    const searchInput = page.getByPlaceholder("検索...");
    await searchInput.fill("ちょしゃいち");
    await expect(page.getByRole("link", { name: "著者1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "著者2" })).not.toBeVisible();
  });

  test("navigates to author detail page", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "著者1" })).toBeVisible();
  });

  test("displays only related books and navigates to a book", async ({
    page,
    mockStore,
  }) => {
    mockStore.createBook({
      title: "共同著者の書籍",
      authorIds: ["author-1", "author-2"],
      isbn: "978-4-00-000005-8",
      read: false,
      owned: true,
      priority: 20,
      format: "PRINTED",
      store: "UNKNOWN",
    });

    await page.getByRole("link", { name: "著者1" }).click();
    const bookTable = page
      .getByRole("heading", { name: "本一覧" })
      .locator("xpath=..")
      .getByRole("table");

    await expect(
      bookTable.getByRole("link", { name: "テスト書籍1" }),
    ).toBeVisible();
    await expect(
      bookTable.getByRole("link", { name: "テスト書籍3" }),
    ).toBeVisible();
    await expect(
      bookTable.getByRole("link", { name: "共同著者の書籍" }),
    ).toBeVisible();
    await expect(
      bookTable.getByRole("link", { name: "テスト書籍2" }),
    ).toHaveCount(0);

    await bookTable.getByRole("link", { name: "共同著者の書籍" }).click();
    await expect(page).toHaveURL(/\/books\/book-5$/);
  });
});

test.describe("Authors CREATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("displays author creation form", async ({ page }) => {
    await expect(page.getByLabel("名前")).toBeVisible();
    await expect(page.getByLabel("読み仮名")).toBeVisible();
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();
  });

  test("creates an author", async ({ page }) => {
    const newAuthorName = "新しい著者";
    const newAuthorYomi = "あたらしいちょしゃ";

    await page.getByLabel("名前").fill(newAuthorName);
    await page.getByLabel("読み仮名").fill(newAuthorYomi);
    await page.getByRole("button", { name: "登録" }).click();

    await expect(
      page.locator("td").filter({ hasText: newAuthorName }),
    ).toBeVisible();
    await expect(
      page.locator("td").filter({ hasText: newAuthorYomi }),
    ).toBeVisible();
  });
});

test.describe("Authors UPDATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("navigates to edit page from detail page", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+$/);

    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/\/authors\/.+\/edit$/);
    await expect(page.getByRole("textbox", { name: "名前" })).toHaveValue(
      "著者1",
    );
    await expect(page.getByRole("textbox", { name: "読み仮名" })).toHaveValue(
      "ちょしゃいち",
    );
  });

  test("updates author name", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/\/authors\/.+\/edit$/);

    const nameInput = page.getByRole("textbox", { name: "名前" });
    await nameInput.fill("更新された著者");
    const yomiInput = page.getByRole("textbox", { name: "読み仮名" });
    await yomiInput.fill("こうしんされたちょしゃ");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/authors\/[^/]+$/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "更新された著者" }),
    ).toBeVisible();
    await expect(
      page.getByText("こうしんされたちょしゃ").first(),
    ).toBeVisible();
  });
});

test.describe("Authors DELETE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("deletes an author after confirmation", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("削除確認")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/authors$/);
    await expect(
      page.locator("td").filter({ hasText: "著者1" }),
    ).not.toBeVisible();
  });

  test("cancel delete keeps author", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("削除確認")).toBeVisible();

    await page.getByRole("button", { name: "キャンセル" }).click();
    await expect(page.getByText("削除確認")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "著者1" })).toBeVisible();
  });
});

test.describe("Authors MERGE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("previews both book lists and merges into the destination", async ({
    page,
    mockStore,
  }) => {
    await page.getByRole("link", { name: "著者を統合" }).click();
    await page.getByRole("combobox", { name: "統合元の著者" }).click();
    await page.getByRole("option", { name: "著者1（ちょしゃいち）" }).click();
    await page.getByRole("combobox", { name: "統合先の著者" }).click();
    await page.getByRole("option", { name: "著者2（ちょしゃに）" }).click();

    await expect(
      page.getByRole("heading", { name: /統合元「著者1」の著書/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /統合先「著者2」の著書/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();

    await page.getByRole("button", { name: "統合内容を確認" }).click();
    await page.getByRole("button", { name: "統合する" }).click();

    await expect(page).toHaveURL(/\/authors\/author-2$/);
    await expect(page.getByRole("heading", { name: "著者2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍3" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍4" })).toBeVisible();

    const sourceDeleteEvent = mockStore
      .getAuthorEvents("author-1")
      .find((event) => event.operation === "DELETE");
    const movedBookEvents = ["book-1", "book-3"].map((bookId) =>
      mockStore
        .getBookEvents(bookId)
        .find((event) => event.operation === "UPDATE"),
    );
    expect(sourceDeleteEvent).toBeDefined();
    expect(sourceDeleteEvent?.extra).toEqual({
      type: "merge",
      version: 1,
      destination_author_id: "author-2",
    });
    const destinationMergeEvent = mockStore
      .getAuthorEvents("author-2")
      .find((event) => event.operation === "MERGE_AS_DESTINATION");
    expect(destinationMergeEvent?.extra).toEqual({
      version: 1,
      source_author_id: "author-1",
    });
    expect(destinationMergeEvent?.eventSetId).toBe(
      sourceDeleteEvent?.eventSetId,
    );
    expect(movedBookEvents).not.toContain(undefined);
    expect(
      movedBookEvents.every(
        (event) => event?.eventSetId === sourceDeleteEvent?.eventSetId,
      ),
    ).toBe(true);

    await page.goto("/authors/author-1");
    await expect(page.getByText("Not found.")).toBeVisible();
  });
});

test.describe("Author History", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("displays history on author detail page", async ({ page }) => {
    await page.goto("/authors");
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByText("CREATE")).toBeVisible();
  });
});
