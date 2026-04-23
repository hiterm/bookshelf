import { expect, test } from "@playwright/test";

test("displays author list", async ({ page }) => {
  await page.goto("/authors");

  await expect(page.locator("td").filter({ hasText: "著者1" })).toBeVisible();
  await expect(page.locator("td").filter({ hasText: "著者2" })).toBeVisible();
});

test("creates author and displays in list", async ({ page }) => {
  await page.goto("/authors");

  // CREATE - 著者を作成
  await page.getByLabel("名前").fill("新規テスト著者");
  await page.getByRole("button", { name: "登録" }).click();

  // 一覧に表示されるか確認（リロードなし）
  await expect(
    page.locator("td").filter({ hasText: "新規テスト著者" }),
  ).toBeVisible();
});
