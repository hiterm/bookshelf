import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("Books READ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("displays book list", async ({ page }) => {
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });

  test("navigates to detail page when clicking book title", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });

  test("displays book information on detail page", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await expect(page.getByText("テスト書籍1")).toBeVisible();
    await expect(page.getByText("978-4-00-000001-0")).toBeVisible();

    await expect(page.getByRole("link", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "変更" })).toBeVisible();
    await expect(page.getByRole("button", { name: "削除" })).toBeVisible();
  });

  test("returns to list with Back button", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/books$/);
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });
});

test.describe("Books CREATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("opens modal with Add button", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();
  });

  test("creates a new book", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

    await page.getByLabel("書名").fill("新しい書籍");

    // TODO: MultiSelect options are rendered in a Portal, so { force: true } click
    // doesn't work. Using keyboard navigation (ArrowDown + Enter) is the most reliable approach.
    // If a better method is found, update all MultiSelect/Select interactions.
    const authorInput = page.getByRole("textbox", { name: "著者" });
    await authorInput.click();
    await authorInput.fill("著者1");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.getByLabel("ISBN").fill("9784000000010");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "追加" })
      .click();

    await expect(page.getByRole("dialog", { name: "追加" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "新しい書籍" })).toBeVisible();

    // Verify created book details
    await page.getByRole("link", { name: "新しい書籍" }).click();
    await expect(page).toHaveURL(/.*books\/book-3/);
    await expect(page.getByText("9784000000010")).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
  });

  test("cannot add when required fields are missing", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "追加" })
      .click();

    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "新しい書籍" }),
    ).not.toBeVisible();
  });

  test("creates a new book with all fields", async ({ page }) => {
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

    await page.getByLabel("書名").fill("全フィールド書籍");

    const authorInput = page.getByRole("textbox", { name: "著者" });
    await authorInput.click();
    await authorInput.fill("著者2");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.getByLabel("ISBN").fill("9784000000027");

    // Set format (Select component)
    const formatSelect = page.getByRole("textbox", { name: "形式" });
    await formatSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Set store (Select component)
    const storeSelect = page.getByRole("textbox", { name: "ストア" });
    await storeSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Set priority
    await page.getByLabel("優先度").fill("90");

    // Set checkboxes
    await page.getByLabel("既読").check();
    await page.getByLabel("所有").check();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "追加" })
      .click();

    await expect(page.getByRole("dialog", { name: "追加" })).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "全フィールド書籍" }),
    ).toBeVisible();

    // Verify created book details
    await page.getByRole("link", { name: "全フィールド書籍" }).click();
    await expect(page.getByText("9784000000027")).toBeVisible();
    await expect(page.locator("text=著者2").first()).toBeVisible();
  });
});

test.describe("Books UPDATE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("navigates to edit page with Edit button", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);
  });

  test("updates book title", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    await page.getByLabel("書名").fill("更新された書籍");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/.*books\/book-1/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByText("更新された書籍")).toBeVisible();
  });

  test("updates all fields", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    // Update all fields
    await page.getByLabel("書名").fill("全フィールド更新");

    // Note: Author MultiSelect adds authors instead of replacing in edit mode
    // Existing author "著者1" will remain, this test focuses on other fields

    await page.getByLabel("ISBN").fill("9784000000999");

    // Change format (Select component) - from PRINTED to E_BOOK
    const formatSelect = page.getByRole("textbox", { name: "形式" });
    await formatSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Change store (Select component) - from UNKNOWN to KINDLE
    const storeSelect = page.getByRole("textbox", { name: "ストア" });
    await storeSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Change priority
    await page.getByLabel("優先度").fill("75");

    // Toggle checkboxes
    await page.getByLabel("既読").check();
    await page.getByLabel("所有").uncheck();

    await page.getByRole("button", { name: "Save" }).click();

    // Verify updates
    await expect(page).toHaveURL(/.*books\/book-1/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByText("全フィールド更新")).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
    await expect(page.getByText("9784000000999")).toBeVisible();
  });

  test("preserves values when not changed", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    // Just click Save without changing anything
    await page.getByRole("button", { name: "Save" }).click();

    // Verify values are unchanged
    await expect(page).toHaveURL(/.*books\/book-1/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByText("テスト書籍1")).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
    await expect(page.getByText("978-4-00-000001-0")).toBeVisible();
  });

  test("returns to detail page with Cancel", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更" }).click();
    await expect(page).toHaveURL(/.*books\/book-1\/edit/);

    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });
});

test.describe("Books DELETE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("opens delete confirmation dialog", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("テスト書籍1を削除しますか？")).toBeVisible();
    await expect(page.getByText("削除確認")).toBeVisible();
  });

  test("closes delete dialog with Cancel", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "キャンセル" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL(/.*books\/book-1/);
  });

  test("deletes a book", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/.*books\/book-1/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/books$/);
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
  });
});
