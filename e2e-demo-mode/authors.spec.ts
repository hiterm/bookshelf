import { expect, test } from "@playwright/test";

test("displays author list", async ({ page }) => {
  await page.goto("/authors");

  await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
  await expect(page.locator("td").filter({ hasText: "著者2" })).toBeVisible();
});

test("creates author and displays in list", async ({ page }) => {
  await page.goto("/authors");

  // CREATE - 著者を作成
  await page.getByLabel("名前").fill("新規テスト著者");
  await page.getByLabel("読み仮名").fill("しんきてすとちょしゃ");
  await page.getByRole("button", { name: "登録" }).click();

  // 一覧に表示されるか確認（リロードなし）
  await expect(
    page.locator("td").filter({ hasText: "新規テスト著者" }),
  ).toBeVisible();
});

test("navigates to author detail page", async ({ page }) => {
  await page.goto("/authors");

  await page.getByRole("link", { name: "著者1" }).click();
  await expect(page).toHaveURL(/\/authors\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "著者1" })).toBeVisible();
});

test("displays books related to the author", async ({ page }) => {
  await page.goto("/authors");
  await page.getByRole("link", { name: "著者1" }).click();

  const bookTable = page
    .getByRole("heading", { name: "本一覧" })
    .locator("xpath=..")
    .getByRole("table");
  await expect(
    bookTable.getByRole("link", { name: "テスト書籍1" }),
  ).toBeVisible();
  await expect(
    bookTable.getByRole("link", { name: "テスト書籍2" }),
  ).toHaveCount(0);
});

test("displays author history on detail page", async ({ page }) => {
  await page.goto("/authors");

  await page.getByRole("link", { name: "著者1" }).click();
  await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "1", exact: true }),
  ).toBeVisible();
});

test("previews both authors' books and merges them", async ({ page }) => {
  await page.goto("/authors");
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
  await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  // Use client-side navigation because a full reload creates a fresh Demo Mode
  // service worker and intentionally resets its in-browser MockStore.
  await page.getByRole("link", { name: "著者", exact: true }).click();
  await expect(page.getByRole("link", { name: "著者1" })).toHaveCount(0);
});

test.describe("author mutations", () => {
  let testAuthorName: string;

  test.beforeEach(async ({ page }) => {
    testAuthorName = `テスト著者-${String(Date.now())}`;
    await page.goto("/authors");
    await page.getByLabel("名前").fill(testAuthorName);
    await page.getByLabel("読み仮名").fill("てすとちょしゃ");
    await page.getByRole("button", { name: "登録" }).click();
    await expect(
      page.locator("td").filter({ hasText: testAuthorName }),
    ).toBeVisible();
  });

  test("updates author name", async ({ page }) => {
    await page.getByRole("link", { name: testAuthorName }).click();
    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+\/edit$/);

    const nameInput = page.getByRole("textbox", { name: "名前" });
    await expect(nameInput).toHaveValue(testAuthorName);
    await nameInput.fill("デモ更新著者");
    const yomiInput = page.getByRole("textbox", { name: "読み仮名" });
    await expect(yomiInput).toHaveValue("てすとちょしゃ");
    await yomiInput.fill("でもこうしんちょしゃ");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/authors\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "デモ更新著者" }),
    ).toBeVisible();
    await expect(page.getByText("でもこうしんちょしゃ").first()).toBeVisible();
  });

  test("deletes author after confirmation", async ({ page }) => {
    await page.getByRole("link", { name: testAuthorName }).click();
    await expect(page).toHaveURL(/\/authors\/[^/]+$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("削除確認")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/authors$/);
    await expect(
      page.locator("td").filter({ hasText: testAuthorName }),
    ).not.toBeVisible();
  });
});
