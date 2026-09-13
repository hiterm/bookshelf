import { expect, test, type Download } from "@playwright/test";
import { text } from "node:stream/consumers";
import { z } from "zod";

const currentDataSchema = z.object({
  authors: z.array(z.looseObject({ name: z.string() })),
  books: z.array(z.looseObject({ title: z.string() })),
});

const envelopeSchema = z.object({
  format: z.literal("bookshelf-backup"),
  version: z.literal(1),
  scope: z.enum(["snapshot", "full"]),
  exportedAt: z.string(),
  data: z.unknown(),
});

const backupFilename = (scope: "snapshot" | "full") =>
  new RegExp(`^bookshelf-backup-${scope}-\\d{4}-\\d{2}-\\d{2}T\\d{6}Z\\.json$`);

async function readDownloadedJson(download: Download): Promise<unknown> {
  const stream = await download.createReadStream();
  return JSON.parse(await text(stream)) as unknown;
}

test("downloads snapshot backup v1 JSON from the demo API", async ({
  page,
}) => {
  await page.goto("/settings/backup");

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "スナップショットをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(backupFilename("snapshot"));
  const body = envelopeSchema.parse(await readDownloadedJson(download));
  expect(body.scope).toBe("snapshot");
  const data = currentDataSchema.strict().parse(body.data);
  expect(data.authors).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "著者1" })]),
  );
  expect(data.books).toEqual(
    expect.arrayContaining([expect.objectContaining({ title: "テスト書籍1" })]),
  );
});

test("downloads full backup v1 JSON from the demo API", async ({ page }) => {
  await page.goto("/settings/backup");

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "完全バックアップをエクスポート" })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(backupFilename("full"));
  const body = envelopeSchema.parse(await readDownloadedJson(download));
  expect(body.scope).toBe("full");
  const data = currentDataSchema
    .extend({
      history: z.object({
        operations: z.array(z.unknown()).min(1),
        bookRevisions: z.array(z.unknown()).min(1),
        authorRevisions: z.array(z.unknown()).min(1),
      }),
    })
    .strict()
    .parse(body.data);
  expect(data.authors.length).toBeGreaterThan(0);
  expect(data.books.length).toBeGreaterThan(0);
});
