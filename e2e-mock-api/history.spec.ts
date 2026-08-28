import { expect } from "@playwright/test";
import { test } from "./fixtures";

test("navigates from change history list to operation detail", async ({
  page,
}) => {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "変更履歴" }).click();
  await expect(page).toHaveURL(/\/history$/);
  const historyLink = page.getByRole("link", { name: /の詳細$/ }).first();
  await expect(historyLink).toBeVisible();
  await historyLink.click();
  await expect(page).toHaveURL(/\/history\/operation-/);
  await expect(
    page.getByRole("heading", { name: /書籍 \(1\)|著者 \(1\)/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button").first()).toBeVisible();
});
