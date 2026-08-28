import { expect, test } from "@playwright/test";

test("opens change history from the Navbar and views a detail", async ({
  page,
}) => {
  await page.goto("/books");
  await page.getByRole("link", { name: "変更履歴" }).click();
  await expect(page.getByRole("heading", { name: "変更履歴" })).toBeVisible();
  await page.getByRole("link", { name: "書籍を更新の詳細" }).click();
  await expect(page).toHaveURL(/\/history\/operation-2$/);
  await expect(page.getByRole("heading", { name: "書籍を更新" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "テスト書籍1（更新）" }),
  ).toBeVisible();
});
