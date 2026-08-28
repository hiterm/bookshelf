import { type Page, expect } from "@playwright/test";
import { test } from "./fixtures";

const parseJsonSearchParam = (value: string | null): unknown =>
  JSON.parse(value ?? "null") as unknown;

const selectFilterOption = async (
  page: Page,
  testId: string,
  optionName: string,
) => {
  await page.getByTestId(testId).getByRole("combobox").click();
  await page.getByRole("option", { name: optionName }).click();
};

test.describe("Books READ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("displays book list", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: "著者読み仮名" }),
    ).toBeVisible();
    const firstBookRow = page
      .getByRole("link", { name: "テスト書籍1" })
      .locator("xpath=ancestor::tr");
    await expect(firstBookRow.getByText("ちょしゃいち")).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
  });

  test("navigates to detail page when clicking book title", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);
  });

  test("displays book information on detail page", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);

    await expect(
      page.getByTestId("book-detail").getByText("テスト書籍1"),
    ).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("978-4-00-000001-0"),
    ).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("著者読み仮名"),
    ).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("ちょしゃいち"),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Back" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "変更", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "削除" })).toBeVisible();
  });

  test("navigates to author detail from book detail", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);

    await page
      .getByTestId("book-detail")
      .getByRole("link", { name: "著者1" })
      .click();

    await expect(page).toHaveURL(/\/authors\/author-1$/);
    await expect(page.getByRole("heading", { name: "著者1" })).toBeVisible();
  });

  test("returns to list with Back button", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);

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

    // Set author (MultiSelect)
    const authorInput = page.getByPlaceholder("著者を検索");
    await authorInput.click();
    await authorInput.fill("著者1");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.getByLabel("ISBN").fill("9784000000010");

    // Set format (Select)
    const formatSelect = page.getByRole("combobox", { name: "形式" });
    await formatSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    await formatSelect.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(formatSelect).toHaveValue("eBook");

    // Set store (Select)
    const storeSelect = page.getByRole("combobox", { name: "ストア" });
    await storeSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    await storeSelect.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(storeSelect).toHaveValue("Kindle");

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
    await expect(page.getByRole("link", { name: "新しい書籍" })).toBeVisible();

    // Verify created book details
    await page.getByRole("link", { name: "新しい書籍" }).click();
    await expect(page).toHaveURL(/\/books\/book-5$/);
    await expect(
      page.getByTestId("book-detail").getByText("9784000000010"),
    ).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
  });
});

test.describe("Books BULK IMPORT", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("imports selected Kindle books after an inclusive date filter", async ({
    page,
  }) => {
    await page.goto("/authors");
    await page.getByLabel("名前").fill("既存著者");
    await page.getByLabel("読み仮名").fill("きそんちょしゃ");
    await page.getByRole("button", { name: "登録" }).click();
    await expect(
      page.locator("td").filter({ hasText: "既存著者" }),
    ).toBeVisible();
    await page.goto("/books");
    await page.getByRole("button", { name: "一括インポート" }).click();
    await expect(page).toHaveURL(/\/books\/import$/);
    const importPage = page.getByRole("main");
    await expect(
      page.getByRole("heading", { name: "書籍一括インポート" }),
    ).toBeVisible();

    await importPage
      .locator('input[type="file"]')
      .setInputFiles("e2e-fixtures/kindle-books.json");
    await expect(importPage.getByText("Kindleインポート当日")).toBeVisible();
    await expect(importPage.getByText("Kindleインポート翌日")).toBeVisible();

    const desktopSettings = importPage.getByText("共通設定").locator("..");
    await expect(desktopSettings).toHaveCSS("position", "sticky");
    const [desktopSourceBox, desktopSettingsBox] = await Promise.all([
      importPage.getByRole("radiogroup", { name: "入力方法" }).boundingBox(),
      desktopSettings.boundingBox(),
    ]);
    expect(desktopSourceBox).not.toBeNull();
    expect(desktopSettingsBox).not.toBeNull();
    expect(desktopSettingsBox?.x).toBeGreaterThan(desktopSourceBox?.x ?? 0);

    await importPage.getByLabel("購入日（指定日以降）").fill("2026-04-24");
    await expect(importPage.getByText("表示中: 3")).toBeVisible();
    await expect(importPage.getByText("Kindleインポート前日")).toBeVisible();

    await importPage.getByLabel("形式").click();
    await page.getByRole("option", { name: "Printed" }).click();
    await importPage.getByLabel("所有している").uncheck();
    await importPage.getByLabel("優先度").fill("75");
    await importPage
      .getByRole("button", {
        name: "表示中の著者をすべて分割",
        exact: true,
      })
      .click();
    await expect(
      importPage.getByText("Kindle共通著者 / 共同著者"),
    ).toBeVisible();

    await importPage
      .getByRole("checkbox", { name: "Kindleインポート翌日をインポート" })
      .uncheck();
    await expect(importPage.getByText("インポート対象: 2")).toBeVisible();
    await importPage.getByRole("button", { name: "プレビュー" }).click();
    await expect(
      page.getByRole("heading", { name: "インポートプレビュー" }),
    ).toBeVisible();
    await expect(
      importPage.getByText("Kindleインポート当日").last(),
    ).toBeVisible();
    await expect(importPage.getByText("既存", { exact: true })).toBeVisible();
    await expect(
      importPage.getByText("新規", { exact: true }).first(),
    ).toBeVisible();
    const importButton = importPage.getByRole("button", {
      name: "2冊をインポート",
    });
    await expect(importButton).toBeInViewport();
    await importButton.click();

    await expect(page.getByText("2冊をインポートしました")).toBeVisible();
    await expect(page).toHaveURL(/\/books$/);
    await expect(
      page.getByRole("link", { name: "Kindleインポート当日" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Kindleインポート翌日" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Kindleインポート前日" }),
    ).toBeVisible();
  });

  test("opens preview from the fixed mobile action", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "一括インポート" }).click();
    const importPage = page.getByRole("main");
    await importPage
      .locator('input[type="file"]')
      .setInputFiles("e2e-fixtures/kindle-books.json");

    const source = importPage.getByRole("radiogroup", { name: "入力方法" });
    const settings = importPage.getByText("共通設定").locator("..");
    const filter = importPage.getByLabel("購入日（指定日以降）");
    const firstBook = importPage.getByText("Kindleインポート前日", {
      exact: true,
    });
    await expect(settings).toHaveCSS("position", "static");
    const [sourceBox, settingsBox, filterBox, firstBookBox] = await Promise.all(
      [
        source.boundingBox(),
        settings.boundingBox(),
        filter.boundingBox(),
        firstBook.boundingBox(),
      ],
    );
    expect(sourceBox).not.toBeNull();
    expect(settingsBox).not.toBeNull();
    expect(filterBox).not.toBeNull();
    expect(firstBookBox).not.toBeNull();
    expect(settingsBox?.y).toBeGreaterThan(sourceBox?.y ?? 0);
    expect(filterBox?.y).toBeGreaterThan(settingsBox?.y ?? 0);
    expect(firstBookBox?.y).toBeGreaterThan(filterBox?.y ?? 0);

    const fixedPreview = importPage.getByRole("button", {
      name: "プレビュー（モバイル固定）",
    });
    await expect(fixedPreview).toBeInViewport();
    await expect(importPage.getByText("対象 3冊")).toBeVisible();
    await fixedPreview.click();
    await expect(
      page.getByRole("heading", { name: "インポートプレビュー" }),
    ).toBeVisible();
    await expect(
      importPage.getByRole("button", { name: "3冊をインポート" }),
    ).toBeInViewport();
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
    await expect(page).toHaveURL(/\/books\/book-1$/);

    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/book-1\/edit$/);
  });

  test("updates all fields", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/book-1\/edit$/);

    // Update all fields
    await page.getByLabel("書名").fill("全フィールド更新");

    // Note: Author MultiSelect adds authors instead of replacing in edit mode
    // Existing author "著者1" will remain, this test focuses on other fields

    await page.getByLabel("ISBN").fill("9784000000999");

    // Change format (Select component) - from PRINTED to E_BOOK
    const formatSelect = page.getByRole("combobox", { name: "形式" });
    await formatSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    await formatSelect.focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(formatSelect).toHaveValue("eBook");

    // Change store (Select component) - from UNKNOWN to KINDLE
    const storeSelect = page.getByRole("combobox", { name: "ストア" });
    await storeSelect.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
    await storeSelect.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(storeSelect).toHaveValue("Kindle");

    // Change priority
    await page.getByLabel("優先度").fill("75");

    // Toggle checkboxes
    await page.getByLabel("既読").check();
    await page.getByLabel("所有").uncheck();

    await page.getByRole("button", { name: "Save" }).click();

    // Verify updates
    await expect(page).toHaveURL(/\/books\/book-1$/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("全フィールド更新"),
    ).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("9784000000999"),
    ).toBeVisible();
  });

  test("preserves values when not changed", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/book-1\/edit$/);

    // Just click Save without changing anything
    await page.getByRole("button", { name: "Save" }).click();

    // Verify values are unchanged
    await expect(page).toHaveURL(/\/books\/book-1$/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("テスト書籍1"),
    ).toBeVisible();
    await expect(page.locator("text=著者1").first()).toBeVisible();
    await expect(
      page.getByTestId("book-detail").getByText("978-4-00-000001-0"),
    ).toBeVisible();
  });

  test("keeps update errors visible after the notification closes", async ({
    page,
  }) => {
    await page.route("http://localhost:4000/graphql", async (route) => {
      const body: unknown = route.request().postDataJSON();
      const query =
        typeof body === "object" &&
        body != null &&
        "query" in body &&
        typeof body.query === "string"
          ? body.query
          : "";
      if (query.includes("mutation updateBook")) {
        await route.fulfill({
          status: 200,
          json: {
            errors: [
              {
                message: "Update rejected",
                extensions: { code: "UPDATE_REJECTED" },
              },
            ],
          },
        });
        return;
      }
      await route.fallback();
    });

    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更", exact: true }).click();
    await page.getByRole("button", { name: "Save" }).click();

    const notification = page
      .locator(".mantine-Notification-root")
      .filter({ hasText: "書籍の更新に失敗しました" });
    const panel = page.getByTestId("persistent-error-panel");
    await expect(notification).toBeVisible();
    await expect(panel.getByText("書籍の更新に失敗しました")).toBeVisible();
    await expect(notification).not.toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText("書籍の更新に失敗しました")).toBeVisible();

    await panel.getByRole("button", { name: "詳細を表示" }).click();
    await expect(panel.getByText(/Operation: UpdateBook/)).toBeVisible();
    await expect(panel.getByText(/Message: Update rejected/)).toBeVisible();
    await panel.getByRole("button", { name: "閉じる" }).click();
    await expect(panel).not.toBeVisible();
  });

  test("returns to detail page with Cancel", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/book-1\/edit$/);

    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);
  });
});

test.describe("Books FILTER SORT AND URL PERSISTENCE", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍3" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍4" })).toBeVisible();
  });

  test("read filter: true shows only read books", async ({ page }) => {
    await selectFilterOption(page, "filter-read", "true");

    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍4" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍3" }),
    ).not.toBeVisible();
  });

  test("owned filter: true shows only owned books", async ({ page }) => {
    await selectFilterOption(page, "filter-owned", "true");

    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍3" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍4" }),
    ).not.toBeVisible();
  });

  test("format filter: Printed shows only printed books", async ({ page }) => {
    await selectFilterOption(page, "filter-format", "Printed");

    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍2" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍3" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍4" }),
    ).not.toBeVisible();
  });

  test("preset filter: Unread owned shows only book1 sorted by priority desc", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Preset filters" }).click();
    await page
      .getByRole("menuitem", { name: "Unread owned, order by priority" })
      .click();

    await expect
      .poll(() => {
        const url = new URL(page.url());
        return {
          columnFilters: parseJsonSearchParam(
            url.searchParams.get("columnFilters"),
          ),
          sorting: parseJsonSearchParam(url.searchParams.get("sorting")),
        };
      })
      .toEqual({
        columnFilters: [
          { id: "read", value: false },
          { id: "owned", value: true },
        ],
        sorting: [{ id: "priority", desc: true }],
      });

    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍2" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍3" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍4" }),
    ).not.toBeVisible();
  });

  test("reset filter: clears all filters and shows all books", async ({
    page,
  }) => {
    await selectFilterOption(page, "filter-read", "true");
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();

    await page
      .getByRole("button", { name: "Reset filter", exact: true })
      .click();

    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍3" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍4" })).toBeVisible();
  });

  test("filter persists on page reload", async ({ page }) => {
    await selectFilterOption(page, "filter-read", "true");
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
    await expect(page).toHaveURL(/columnFilters/);

    await page.reload();
    await expect(page.getByRole("link", { name: "テスト書籍2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "テスト書籍4" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "テスト書籍3" }),
    ).not.toBeVisible();
  });

  test("sort persists on page reload", async ({ page }) => {
    await page.getByRole("columnheader", { name: "優先度" }).click();
    await expect(page).toHaveURL(/sorting/);

    const rowsBeforeReload = await page
      .getByRole("row")
      .filter({ hasText: /テスト書籍[1-4]/ })
      .all();
    const textsBeforeReload = await Promise.all(
      rowsBeforeReload.map((r) => r.textContent()),
    );

    await page.reload();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();

    const rowsAfterReload = await page
      .getByRole("row")
      .filter({ hasText: /テスト書籍[1-4]/ })
      .all();
    const textsAfterReload = await Promise.all(
      rowsAfterReload.map((r) => r.textContent()),
    );

    expect(textsAfterReload).toEqual(textsBeforeReload);
  });

  test("reset clears filter URL params", async ({ page }) => {
    await selectFilterOption(page, "filter-read", "true");
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();

    await page.getByRole("columnheader", { name: "優先度" }).click();
    await expect(page).toHaveURL(/sorting/);

    await page
      .getByRole("button", { name: "Reset filter", exact: true })
      .click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(page).not.toHaveURL(/columnFilters/);
    await expect(page).not.toHaveURL(/sorting/);
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
    await expect(page).toHaveURL(/\/books\/book-1$/);

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
    await expect(page).toHaveURL(/\/books\/book-1$/);
  });

  test("deletes a book", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);

    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "削除する" }).click();

    await expect(page).toHaveURL(/\/books$/);
    await expect(
      page.getByRole("link", { name: "テスト書籍1" }),
    ).not.toBeVisible();
  });
});

test.describe("Book History", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  });

  test("displays history on book detail page", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible();
  });

  test("displays two revisions after book update", async ({ page }) => {
    await page.getByRole("link", { name: "テスト書籍1" }).click();
    await expect(page).toHaveURL(/\/books\/book-1$/);

    await page.getByRole("link", { name: "変更", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/book-1\/edit$/);
    await page.getByLabel("書名").fill("更新テスト書籍");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/books\/book-1$/);
    await expect(page.getByText("更新しました")).toBeVisible();
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "2", exact: true }),
    ).toBeVisible();
  });
});
