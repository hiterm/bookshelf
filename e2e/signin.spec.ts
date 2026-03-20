import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Sign in", () => {
  test("shows book list after clicking login button", async ({ page }) => {
    await page.goto("/books");

    // 未認証状態では Login ボタンが表示されるのでクリック
    await page.getByRole("button", { name: "Login" }).click();

    // Mockが books クエリに返すデータが表示されることを確認
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible({
      timeout: 15000,
    });
  });
});
