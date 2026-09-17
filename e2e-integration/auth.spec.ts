import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe.serial("Auth integration", () => {
  test("registers new user and shows books page", async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("button", { name: "Register user" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Register user" }).click();
    await expect(page).toHaveURL(/\/books$/);
    await expect(page.getByRole("link", { name: "本" })).toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).toBeVisible();
  });
});
