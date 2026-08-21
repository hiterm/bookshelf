import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";

const AUTHOR_NAME = "統合テスト著者";
const AUTHOR_YOMI = "とうごうてすとちょしゃ";
const UPDATED_AUTHOR_NAME = "更新された統合テスト著者";
const UPDATED_AUTHOR_YOMI = "こうしんされたとうごうてすとちょしゃ";

async function loginAndRegister(page: Page) {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(
    page.getByRole("button", { name: "Register user" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register user" }).click();
  await expect(page).toHaveURL(/\/books$/);
}

test.describe
  .serial("Authors CRUD integration", () => {
    test("creates, displays, updates, and deletes an author", async ({
      page,
    }) => {
      await loginAndRegister(page);

      // Create author
      await page.goto("/authors");
      await page.getByLabel("名前").fill(AUTHOR_NAME);
      await page.getByLabel("読み仮名").fill(AUTHOR_YOMI);
      await page.getByRole("button", { name: "登録" }).click();
      await expect(
        page.locator("td").filter({ hasText: AUTHOR_NAME }),
      ).toBeVisible();

      // Navigate to detail page
      await page.getByRole("link", { name: AUTHOR_NAME }).click();
      await expect(page).toHaveURL(/\/authors\/.+$/);
      await expect(
        page.getByRole("heading", { name: AUTHOR_NAME }),
      ).toBeVisible();

      // Update the author
      await page.getByRole("link", { name: "変更" }).click();
      await expect(page).toHaveURL(/\/authors\/.+\/edit$/);

      const nameInput = page.getByRole("textbox", { name: "名前" });
      await expect(nameInput).toHaveValue(AUTHOR_NAME);
      await nameInput.fill(UPDATED_AUTHOR_NAME);
      const yomiInput = page.getByRole("textbox", { name: "読み仮名" });
      await expect(yomiInput).toHaveValue(AUTHOR_YOMI);
      await yomiInput.fill(UPDATED_AUTHOR_YOMI);
      await page.getByRole("button", { name: "Save" }).click();

      await expect(page).toHaveURL(/\/authors\/.+$/);
      await expect(page.getByText("更新しました")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: UPDATED_AUTHOR_NAME }),
      ).toBeVisible();
      await expect(page.getByText(UPDATED_AUTHOR_YOMI).first()).toBeVisible();

      // Delete the author
      await page.getByRole("button", { name: "削除" }).click();
      await expect(page.getByText("削除確認")).toBeVisible();
      await page.getByRole("button", { name: "削除する" }).click();

      await expect(page).toHaveURL(/\/authors$/);
      await expect(
        page.locator("td").filter({ hasText: UPDATED_AUTHOR_NAME }),
      ).toHaveCount(0);
    });
  });

test.describe
  .serial("Author history", () => {
    test("displays history after author creation", async ({ page }) => {
      await loginAndRegister(page);

      // Create author
      await page.goto("/authors");
      await page.getByLabel("名前").fill(AUTHOR_NAME);
      await page.getByLabel("読み仮名").fill(AUTHOR_YOMI);
      await page.getByRole("button", { name: "登録" }).click();
      await expect(
        page.locator("td").filter({ hasText: AUTHOR_NAME }),
      ).toBeVisible();

      // Navigate to detail page and verify history
      await page.getByRole("link", { name: AUTHOR_NAME }).click();
      await expect(page).toHaveURL(/\/authors\/.+$/);
      await expect(
        page.getByRole("heading", { name: "History" }),
      ).toBeVisible();
      await expect(page.getByText("CREATE")).toBeVisible();
    });
  });

test("displays related books and an empty state from the real API", async ({
  page,
}) => {
  const relatedAuthorName = "書籍あり統合テスト著者";
  const emptyAuthorName = "書籍なし統合テスト著者";
  const relatedBookTitle = "著者詳細統合テスト書籍";

  await loginAndRegister(page);

  await page.goto("/authors");
  await page.getByLabel("名前").fill(relatedAuthorName);
  await page.getByLabel("読み仮名").fill("しょせきありとうごうてすとちょしゃ");
  await page.getByRole("button", { name: "登録" }).click();
  await expect(
    page.getByRole("link", { name: relatedAuthorName }),
  ).toBeVisible();

  await page.getByLabel("名前").fill(emptyAuthorName);
  await page.getByLabel("読み仮名").fill("しょせきなしとうごうてすとちょしゃ");
  await page.getByRole("button", { name: "登録" }).click();
  await expect(page.getByRole("link", { name: emptyAuthorName })).toBeVisible();

  await page.goto("/books");
  await page.getByRole("button", { name: "追加" }).click();
  await page.getByLabel("書名").fill(relatedBookTitle);
  const authorInput = page.getByPlaceholder("著者を検索");
  await authorInput.click();
  await authorInput.fill(relatedAuthorName);
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").getByRole("button", { name: "追加" }).click();
  await expect(
    page.getByRole("link", { name: relatedBookTitle }),
  ).toBeVisible();

  await page.goto("/authors");
  await page.getByRole("link", { name: relatedAuthorName }).click();
  await expect(
    page.getByRole("link", { name: relatedBookTitle }),
  ).toBeVisible();

  await page.goto("/authors");
  await page.getByRole("link", { name: emptyAuthorName }).click();
  await expect(page.getByText("この著者の本はありません")).toBeVisible();
});
