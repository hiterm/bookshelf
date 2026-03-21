import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Existing user", () => {
  test("/ redirects to /books after login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/books$/);
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });
});

test.describe("New user", () => {
  test.use({ isNewUser: true });

  test("shows register button for new user", async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("button", { name: "Register user" }),
    ).toBeVisible();
  });

  test("registers user and shows books", async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
      page.getByRole("button", { name: "Register user" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Register user" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "本" })).toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).toBeVisible();
  });
});
