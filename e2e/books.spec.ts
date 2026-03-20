import { expect, test } from "@playwright/test";
import { mockAuth0Login } from "./helpers/auth";

test.describe("Books READ", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth0Login(page);
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("書籍一覧が表示される", async ({ page }) => {
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });

  test("書籍タイトルをクリックすると詳細ページに遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });

  test("書籍詳細ページに情報が表示される", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    // 詳細情報が表示される
    await expect(page.getByText("テスト書籍1")).toBeVisible();
    await expect(page.getByText("978-4-00-000001-0")).toBeVisible();

    // アクションボタンが表示される
    await expect(page.getByRole("link", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "変更" })).toBeVisible();
    await expect(page.getByRole("button", { name: "削除" })).toBeVisible();
  });

  test("Backボタンで一覧に戻る", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/.*books/);
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });
});
