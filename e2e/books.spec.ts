import { expect, test } from "@playwright/test";
import { mockAuth0Login } from "./helpers/auth";

test.describe("書籍一覧", () => {
  test("書籍一覧ページが表示される", async ({ page }) => {
    await mockAuth0Login(page);

    await page.goto("/books");

    // 未認証状態では Login ボタンが表示されるのでクリック
    await page.getByRole("button", { name: "Login" }).click();

    // MSW が books クエリに返すモックデータが表示されることを確認
    await expect(page.getByText("テスト書籍1")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("テスト書籍2")).toBeVisible();
  });
});
