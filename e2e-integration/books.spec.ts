import { expect } from "@playwright/test";
import { test } from "./fixtures";

const BOOK_TITLE = "統合テスト書籍";
const AUTHOR_NAME = "統合テスト著者";
const UPDATED_TITLE = "更新された統合テスト書籍";

async function loginAndRegister(page: import("@playwright/test").Page) {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(
    page.getByRole("button", { name: "Register user" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register user" }).click();
  await expect(page).toHaveURL(/\/books$/);
}

test.describe
  .serial("Books CRUD integration", () => {
    test("creates, displays, updates, and deletes a book", async ({ page }) => {
      await loginAndRegister(page);

      // Create author
      await page.goto("/authors");
      await page.getByLabel("名前").fill(AUTHOR_NAME);
      await page.getByRole("button", { name: "登録" }).click();
      await expect(
        page.locator("td").filter({ hasText: AUTHOR_NAME }),
      ).toBeVisible();

      // Navigate to books and create a book
      await page.goto("/books");
      await page.getByRole("button", { name: "追加" }).click();
      await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

      await page.getByLabel("書名").fill(BOOK_TITLE);

      const authorInput = page.getByRole("textbox", { name: "著者" });
      await authorInput.click();
      await authorInput.fill(AUTHOR_NAME);
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "追加" })
        .click();

      await expect(
        page.getByRole("dialog", { name: "追加" }),
      ).not.toBeVisible();
      await expect(page.getByRole("link", { name: BOOK_TITLE })).toBeVisible();

      // Navigate to detail page
      await page.getByRole("link", { name: BOOK_TITLE }).click();
      await expect(page).toHaveURL(/\/books\/.+$/);
      await expect(page.getByText(BOOK_TITLE)).toBeVisible();

      // Update the book
      await page.getByRole("link", { name: "変更" }).click();
      await expect(page).toHaveURL(/\/books\/.+\/edit$/);

      await page.getByLabel("書名").fill(UPDATED_TITLE);
      await page.getByRole("button", { name: "Save" }).click();

      await expect(page).toHaveURL(/\/books\/.+$/);
      await expect(page.getByText("更新しました")).toBeVisible();
      await expect(page.getByText(UPDATED_TITLE)).toBeVisible();

      // Delete the book
      await page.getByRole("button", { name: "削除" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("button", { name: "削除する" }).click();

      await expect(page).toHaveURL(/\/books$/);
      await expect(
        page.getByRole("link", { name: UPDATED_TITLE }),
      ).not.toBeVisible();
    });
  });
