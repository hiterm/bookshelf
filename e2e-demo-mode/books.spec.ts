import { expect, test } from "@playwright/test";

test("displays book list", async ({ page }) => {
  await page.goto("/books");

  await expect(page.getByRole("link", { name: "本" })).toBeVisible();
  await expect(page.getByRole("link", { name: "著者" })).toBeVisible();
  await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
});

test("creates book and displays in list", async ({ page }) => {
  await page.goto("/books");

  // CREATE - 書籍を作成
  await page.getByRole("button", { name: "追加" }).click();
  await expect(page.getByRole("dialog", { name: "追加" })).toBeVisible();

  await page.getByLabel("書名").fill("新規テスト書籍");

  const authorInput = page.getByRole("textbox", { name: "著者" });
  await authorInput.click();
  await authorInput.fill("著者1");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await page.getByLabel("ISBN").fill("9784000000999");

  const formatSelect = page.getByRole("textbox", { name: "形式" });
  await formatSelect.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option").first()).toBeVisible();
  await formatSelect.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  // Verify format was selected (default UNKNOWN, ArrowDown selects E_BOOK which displays as "eBook")
  await expect(formatSelect).toHaveValue("eBook");

  const storeSelect = page.getByRole("textbox", { name: "ストア" });
  await storeSelect.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option").first()).toBeVisible();
  await storeSelect.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  // Verify store was selected (default UNKNOWN, ArrowDown selects KINDLE which displays as "Kindle")
  await expect(storeSelect).toHaveValue("Kindle");

  await page.getByLabel("優先度").fill("90");
  await page.getByLabel("既読").check();
  await page.getByLabel("所有").check();

  await page.getByRole("dialog").getByRole("button", { name: "追加" }).click();

  // ダイアログが閉じるのを待つ
  await expect(page.getByRole("dialog", { name: "追加" })).not.toBeVisible();

  // 一覧に表示されるか確認（リロードなし）
  await expect(
    page.getByRole("link", { name: "新規テスト書籍" }),
  ).toBeVisible();
});

test("updates book", async ({ page }) => {
  await page.goto("/books");

  await page.getByRole("link", { name: "テスト書籍1" }).click();
  await page.getByRole("link", { name: "変更" }).click();

  await page.getByLabel("書名").fill("更新済みテスト書籍1");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("更新しました")).toBeVisible();
  await expect(page.getByText("更新済みテスト書籍1")).toBeVisible();
});

test("deletes book", async ({ page }) => {
  await page.goto("/books");

  await page.getByRole("link", { name: "テスト書籍2" }).click();
  await page.getByRole("button", { name: "削除" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("テスト書籍2を削除しますか？")).toBeVisible();

  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(
    page.getByRole("link", { name: "テスト書籍2" }),
  ).not.toBeVisible();
});
