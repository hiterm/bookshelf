import { expect, test } from "@playwright/test";

test("displays author list", async ({ page }) => {
  await page.goto("/authors");

  await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
  await expect(page.locator("td").filter({ hasText: "著者2" })).toBeVisible();
});
