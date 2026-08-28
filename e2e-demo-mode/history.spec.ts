import { expect, test } from "@playwright/test";

test("opens change history from the Navbar and views a detail", async ({
  page,
}) => {
  await page.goto("/books");
  await page.getByRole("link", { name: "変更履歴" }).click();
  await expect(page.getByRole("heading", { name: "変更履歴" })).toBeVisible();
  await page.getByRole("link", { name: "書籍を追加の詳細" }).first().click();
  await expect(page).toHaveURL(/\/history\/operation-4$/);
  await expect(page.locator("h1", { hasText: "書籍を追加" })).toBeVisible();
  await expect(page.getByRole("button", { name: "テスト書籍2" })).toBeVisible();
});
