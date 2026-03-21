import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Layout - Before Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
  });

  test("displays Bookshelf title in header", async ({ page }) => {
    await expect(page.getByText("Bookshelf").first()).toBeVisible();
  });

  test("displays user menu button in header", async ({ page }) => {
    await expect(
      page.locator('header button[aria-haspopup="menu"]'),
    ).toBeVisible();
  });

  test("hides navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "本" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).not.toBeVisible();
  });

  test("displays Login button in main area", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});

test.describe("Layout - After Login", () => {
  test("displays correct layout after login", async ({ page }) => {
    await page.goto("/books");

    await expect(page.getByText("Bookshelf").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();

    await expect(page.getByText("Bookshelf").first()).toBeVisible();

    await expect(
      page.locator('header button[aria-haspopup="menu"]'),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "本" })).toBeVisible();
    await expect(page.getByRole("link", { name: "著者" })).toBeVisible();

    await page.locator('header button[aria-haspopup="menu"]').click();
    await expect(page.getByText("Logout")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("link", { name: "著者" }).click();
    await expect(page).toHaveURL(/.*authors/);

    await page.getByText("Bookshelf").first().click();
    await expect(page).toHaveURL(/.*books/);
  });

  test("logs out successfully", async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();

    // Open user menu and click Logout
    await page.locator('header button[aria-haspopup="menu"]').click();
    await page.getByText("Logout").click();

    // Wait for redirect to home page after logout
    await page.waitForURL("/");

    // Verify logged out state
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍2" }),
    ).not.toBeVisible();

    // Verify the unauthenticated state persists after reload
    await page.reload();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍2" }),
    ).not.toBeVisible();
  });
});
