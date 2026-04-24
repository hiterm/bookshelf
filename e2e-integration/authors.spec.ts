import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";

const AUTHOR_NAME = "統合テスト著者";
const UPDATED_AUTHOR_NAME = "更新された統合テスト著者";

async function loginAndRegister(page: Page) {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(
    page.getByRole("button", { name: "Register user" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register user" }).click();
  await expect(page).toHaveURL(/\/books$/);
}

test.describe
  .serial("Authors CRUD integration", () => {
    test("creates, displays, updates, and deletes an author", async ({
      page,
    }) => {
      await loginAndRegister(page);

      // Create author
      await page.goto("/authors");
      await page.getByLabel("名前").fill(AUTHOR_NAME);
      await page.getByRole("button", { name: "登録" }).click();
      await expect(
        page.locator("td").filter({ hasText: AUTHOR_NAME }),
      ).toBeVisible();

      // Navigate to detail page
      await page.getByRole("link", { name: AUTHOR_NAME }).click();
      await expect(page).toHaveURL(/\/authors\/.+$/);
      await expect(page.getByText(AUTHOR_NAME)).toBeVisible();

      // Update the author
      await page.getByRole("button", { name: "変更" }).click();
      await expect(page).toHaveURL(/\/authors\/.+\/edit$/);

      const nameInput = page.getByRole("textbox", { name: "名前" });
      await expect(nameInput).toHaveValue(AUTHOR_NAME);
      await nameInput.fill(UPDATED_AUTHOR_NAME);
      await page.getByRole("button", { name: "Save" }).click();

      await expect(page).toHaveURL(/\/authors\/.+$/);
      await expect(page.getByText("更新しました")).toBeVisible();
      await expect(page.getByText(UPDATED_AUTHOR_NAME)).toBeVisible();

      // Delete the author
      await page.getByRole("button", { name: "削除" }).click();
      await expect(page.getByText("削除確認")).toBeVisible();
      await page.getByRole("button", { name: "削除する" }).click();

      await expect(page).toHaveURL(/\/authors$/);
      await expect(
        page.locator("td").filter({ hasText: UPDATED_AUTHOR_NAME }),
      ).not.toBeVisible();
    });
  });
