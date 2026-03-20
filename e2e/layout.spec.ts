import { expect, test } from "@playwright/test";
import { mockAuth0Login } from "./helpers/auth";

test.describe("Layout - ログイン前", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
  });

  test("ヘッダーに Bookshelf タイトルが表示される", async ({ page }) => {
    await expect(page.getByText("Bookshelf").first()).toBeVisible();
  });

  test("ヘッダーにユーザーメニューボタンが表示される", async ({ page }) => {
    await expect(
      page.locator('header button[aria-haspopup="menu"]'),
    ).toBeVisible();
  });

  test("ナビゲーションリンクが表示されない", async ({ page }) => {
    await expect(page.getByRole("link", { name: "本" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).not.toBeVisible();
  });

  test("メインエリアに Login ボタンが表示される", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});

test.describe("Layout - ログイン後", () => {
  test("ログイン後のレイアウトが正しく表示される", async ({ page }) => {
    await mockAuth0Login(page);
    await page.goto("/books");

    // ログイン前：ヘッダーとログインボタンが表示される
    await expect(page.getByText("Bookshelf").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

    // ログイン
    await page.getByRole("button", { name: "Login" }).click();

    // 認証完了を待つ（書籍データが表示されるまで）
    await expect(page.getByText("テスト書籍1")).toBeVisible({ timeout: 15000 });

    // ヘッダーに Bookshelf タイトルが表示される
    await expect(page.getByText("Bookshelf").first()).toBeVisible();

    // ヘッダーにユーザーメニューボタンが表示される
    await expect(
      page.locator('header button[aria-haspopup="menu"]'),
    ).toBeVisible();

    // サイドバーにナビゲーションリンクが表示される
    await expect(page.getByRole("link", { name: "本" })).toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).toBeVisible();

    // ユーザーメニューに Logout が表示される
    await page.locator('header button[aria-haspopup="menu"]').click();
    await expect(page.getByText("Logout")).toBeVisible();
    await page.keyboard.press("Escape");

    // 著者リンクをクリックすると著者一覧に遷移する
    await page.getByRole("link", { name: "著者" }).click();
    await expect(page).toHaveURL(/.*authors/);

    // Bookshelf タイトルをクリックすると書籍一覧に遷移する
    await page.getByText("Bookshelf").first().click();
    await expect(page).toHaveURL(/.*books/);
  });
});
