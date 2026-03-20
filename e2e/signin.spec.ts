import { expect, test } from "@playwright/test";
import { mockAuth0Login } from "./helpers/auth";

test.describe("Sign in", () => {
  test("shows book list after clicking login button", async ({ page }) => {
    await mockAuth0Login(page);

    await page.goto("/books");

    // 未認証状態では Login ボタンが表示されるのでクリック
    await page.getByRole("button", { name: "Login" }).click();

    // MSW が books クエリに返すモックデータが表示されることを確認
    await expect(page.getByText("テスト書籍1")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("テスト書籍2")).toBeVisible({ timeout: 15000 });
  });
});
