import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Books READ", () => {
  test.beforeEach(async ({ page }) => {
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

    await expect(page.getByText("テスト書籍1")).toBeVisible();
    await expect(page.getByText("978-4-00-000001-0")).toBeVisible();

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

test.describe("Books CREATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("追加ボタンでモーダルが開く", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();
  });

  test("書籍を新規作成できる", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

    await page.getByLabel("書名").fill("新しい書籍");

    const authorInput = page.getByRole("textbox", { name: "著者" });
    await authorInput.click();
    await authorInput.fill("著者1");
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    await page.getByLabel("ISBN").fill("9784000000010");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "追加" })
      .click();

    await expect(page.getByRole("dialog", { name: "追加" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "新しい書籍" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("必須項目が未入力だと追加できない", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "追加" })
      .click();

    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新しい書籍" }),
    ).not.toBeVisible();
  });
});

test.describe("Books UPDATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("変更ボタンで編集ページに遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);
  });

  test("書籍タイトルを更新できる", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    await page.getByLabel("書名").fill("更新された書籍");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/.*books\/book-1/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByText("更新された書籍")).toBeVisible();
  });

  test("Cancelで詳細ページに戻る", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });
});

test.describe("Books DELETE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("削除ボタンで確認ダイアログが開く", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("テスト書籍1を削除しますか？")).toBeVisible();
    await expect(page.getByText("削除確認")).toBeVisible();
  });

  test("キャンセルで削除ダイアログを閉じられる", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "キャンセル" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });

  test("書籍を削除できる", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/books$/);
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
  });
});
