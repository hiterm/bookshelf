import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Authors READ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
    await page.goto("/authors");
  });

  test("displays author list", async ({ page }) => {
    await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "著者2" })).toBeVisible();
  });

  test("search functionality works", async ({ page }) => {
    const searchInput = page.getByPlaceholder("検索...");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("著者1");
    await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
    await expect(
      page.locator("td").filter({ hasText: "著者2" }),
    ).not.toBeVisible();
  });
});

test.describe("Authors CREATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible({
      timeout: 15000,
    });
    await page.goto("/authors");
  });

  test("displays author creation form", async ({ page }) => {
    await expect(page.getByLabel("名前")).toBeVisible();
    await expect(page.getByRole("button", { name: "登録" })).toBeVisible();
  });

  test("creates an author", async ({ page }) => {
    const newAuthorName = "新しい著者";

    await page.getByLabel("名前").fill(newAuthorName);
    await page.getByRole("button", { name: "登録" }).click();

    await expect(
      page.locator("td").filter({ hasText: newAuthorName }),
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
