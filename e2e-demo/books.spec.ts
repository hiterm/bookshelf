import { expect, test } from "@playwright/test";

test("displays book list without login in demo mode", async ({ page }) => {
  await page.goto("/books");

  await expect(page.getByRole("link", { name: "本" })).toBeVisible();
  await expect(page.getByRole("link", { name: "著者" })).toBeVisible();
});
