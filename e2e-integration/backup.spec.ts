import { expect, type Download, type Page } from "@playwright/test";
import { text } from "node:stream/consumers";
import { z } from "zod";
import { test } from "./fixtures";

const currentDataSchema = z.object({
  authors: z.array(z.object({ name: z.string() })),
  books: z.array(z.object({ title: z.string() })),
});

const backupEnvelopeSchema = z.object({
  format: z.literal("bookshelf-backup"),
  version: z.literal(1),
  scope: z.enum(["snapshot", "full"]),
  exportedAt: z.string(),
  data: z.unknown(),
});

const backupFilename = (scope: "snapshot" | "full") =>
  new RegExp(`^bookshelf-backup-${scope}-\\d{4}-\\d{2}-\\d{2}T\\d{6}Z\\.json$`);

async function loginAndRegister(page: Page) {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(
    page.getByRole("button", { name: "Register user" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register user" }).click();
  await expect(page).toHaveURL(/\/books$/);
}

async function createLibraryData(page: Page) {
  const suffix = crypto.randomUUID();
  const authorName = `バックアップ統合著者-${suffix}`;
  const bookTitle = `バックアップ統合書籍-${suffix}`;

  await page.goto("/authors");
  await page.getByLabel("名前").fill(authorName);
  await page.getByLabel("読み仮名").fill("ばっくあっぷとうごうちょしゃ");
  await page.getByRole("button", { name: "登録" }).click();
  await expect(
    page.locator("td").filter({ hasText: authorName }),
  ).toBeVisible();

  await page.goto("/books");
  await page.getByRole("button", { name: "追加" }).click();
  await page.getByLabel("書名").fill(bookTitle);
  const authorInput = page.getByPlaceholder("著者を検索");
  await authorInput.click();
  await authorInput.fill(authorName);
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").getByRole("button", { name: "追加" }).click();
  await expect(page.getByRole("link", { name: bookTitle })).toBeVisible();

  return { authorName, bookTitle };
}

async function readDownloadedJson(download: Download): Promise<unknown> {
  const stream = await download.createReadStream();
  const parsed: unknown = JSON.parse(await text(stream));
  return parsed;
}

test("downloads a snapshot backup from the real backend", async ({ page }) => {
  await loginAndRegister(page);
  const { authorName, bookTitle } = await createLibraryData(page);
  await page.goto("/settings/backup");

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "スナップショットをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(backupFilename("snapshot"));
  const body = backupEnvelopeSchema.parse(await readDownloadedJson(download));
  expect(body.scope).toBe("snapshot");
  const data = currentDataSchema.strict().parse(body.data);
  expect(data.authors).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: authorName })]),
  );
  expect(data.books).toEqual(
    expect.arrayContaining([expect.objectContaining({ title: bookTitle })]),
  );
});

test("downloads a full backup from the real backend", async ({ page }) => {
  await loginAndRegister(page);
  const { authorName, bookTitle } = await createLibraryData(page);
  await page.goto("/settings/backup");

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "完全バックアップをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(backupFilename("full"));
  const body = backupEnvelopeSchema.parse(await readDownloadedJson(download));
  expect(body.scope).toBe("full");
  const data = currentDataSchema
    .extend({
      history: z.object({
        operations: z.array(z.unknown()).min(1),
        bookRevisions: z.array(z.unknown()).min(1),
        authorRevisions: z.array(z.unknown()).min(1),
      }),
    })
    .parse(body.data);
  expect(data.authors).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: authorName })]),
  );
  expect(data.books).toEqual(
    expect.arrayContaining([expect.objectContaining({ title: bookTitle })]),
  );
});
