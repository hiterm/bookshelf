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
  await page.getByRole("button", { name: "登録" }).click();

  // 一覧に表示されるか確認（リロードなし）
  await expect(
    page.locator("td").filter({ hasText: "新規テスト著者" }),
  ).toBeVisible();
});

test("navigates to author detail page", async ({ page }) => {
  await page.goto("/authors");

  await page.getByRole("link", { name: "著者1" }).click();
  await expect(page).toHaveURL(/\/authors\/.+$/);
  await expect(page.getByText("著者1")).toBeVisible();
});

test("updates author name", async ({ page }) => {
  await page.goto("/authors");

  await page.getByRole("link", { name: "著者1" }).click();
  await page.getByRole("link", { name: "変更" }).click();
  await expect(page).toHaveURL(/\/authors\/.+\/edit$/);

  const nameInput = page.getByRole("textbox", { name: "名前" });
  await expect(nameInput).toHaveValue("著者1");
  await nameInput.fill("デモ更新著者");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/authors\/.+$/);
  await expect(page.getByText("デモ更新著者")).toBeVisible();
});

test("deletes author after confirmation", async ({ page }) => {
  await page.goto("/authors");

  await page.getByRole("link", { name: "著者1" }).click();
  await expect(page).toHaveURL(/\/authors\/.+$/);

  await page.getByRole("button", { name: "削除" }).click();
  await expect(page.getByText("削除確認")).toBeVisible();

  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page).toHaveURL(/\/authors$/);
  await expect(
    page.locator("td").filter({ hasText: "著者1" }),
  ).not.toBeVisible();
});
