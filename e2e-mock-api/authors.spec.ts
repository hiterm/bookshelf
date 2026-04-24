import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Authors READ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
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

  test("navigates to author detail page", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/.+$/);
    await expect(page.getByText("著者1")).toBeVisible();
  });
});

test.describe("Authors CREATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
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
    ).toBeVisible();
  });
});

test.describe("Authors UPDATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("navigates to edit page from detail page", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/.+$/);

    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/\/authors\/.+\/edit$/);
    await expect(page.getByRole("textbox", { name: "名前" })).toHaveValue(
      "著者1",
    );
  });

  test("updates author name", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/\/authors\/.+\/edit$/);

    const nameInput = page.getByRole("textbox", { name: "名前" });
    await nameInput.fill("更新された著者");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/authors\/.+$/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByText("更新された著者")).toBeVisible();
  });
});

test.describe("Authors DELETE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await page.goto("/authors");
  });

  test("deletes an author after confirmation", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/.+$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("削除確認")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/authors$/);
    await expect(
      page.locator("td").filter({ hasText: "著者1" }),
    ).not.toBeVisible();
  });

  test("cancel delete keeps author", async ({ page }) => {
    await page.getByRole("link", { name: "著者1" }).click();
    await expect(page).toHaveURL(/\/authors\/.+$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("削除確認")).toBeVisible();

    await page.getByRole("button", { name: "キャンセル" }).click();
    await expect(page.getByText("削除確認")).not.toBeVisible();
    await expect(page.getByText("著者1")).toBeVisible();
  });
});
