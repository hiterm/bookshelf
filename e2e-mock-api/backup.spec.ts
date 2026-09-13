import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  await page.getByRole("link", { name: "設定" }).click();
  await expect(page).toHaveURL(/\/settings\/backup$/);
});

test("downloads snapshot with authentication and a generated filename", async ({
  page,
}) => {
  let authorization: string | undefined;
  await page.route(
    "http://localhost:4000/v1/backup/snapshot",
    async (route) => {
      authorization = route.request().headers().authorization;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ format: "bookshelf-backup", version: 1 }),
      });
    },
  );

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "スナップショットをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(authorization).toBe("Bearer mock-access-token");
  expect(download.suggestedFilename()).toMatch(
    /^bookshelf-backup-snapshot-\d{4}-\d{2}-\d{2}T\d{6}Z\.json$/,
  );
});

test("downloads full with authentication and a generated filename", async ({
  page,
}) => {
  let authorization: string | undefined;
  await page.route("http://localhost:4000/v1/backup/full", async (route) => {
    authorization = route.request().headers().authorization;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ format: "bookshelf-backup", version: 1 }),
    });
  });

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "完全バックアップをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(authorization).toBe("Bearer mock-access-token");
  expect(download.suggestedFilename()).toMatch(
    /^bookshelf-backup-full-\d{4}-\d{2}-\d{2}T\d{6}Z\.json$/,
  );
});

test("reports a full backup HTTP error without a download", async ({
  page,
}) => {
  await page.route("http://localhost:4000/v1/backup/full", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "backup unavailable" }),
    });
  });
  let downloaded = false;
  page.on("download", () => {
    downloaded = true;
  });

  await page
    .getByRole("button", { name: "完全バックアップをエクスポート" })
    .click();

  await expect(
    page.getByText("バックアップのエクスポートに失敗しました").first(),
  ).toBeVisible();
  expect(downloaded).toBe(false);
});

test("rejects an HTML fallback without a download", async ({ page }) => {
  await page.route(
    "http://localhost:4000/v1/backup/snapshot",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>SPA fallback</title>",
      });
    },
  );
  let downloaded = false;
  page.on("download", () => {
    downloaded = true;
  });

  await page
    .getByRole("button", { name: "スナップショットをエクスポート" })
    .click();

  await expect(
    page.getByText("バックアップのエクスポートに失敗しました").first(),
  ).toBeVisible();
  expect(downloaded).toBe(false);
});
