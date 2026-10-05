import { expect, test } from "@playwright/test";
test("atomically saves multiple pending authors in demo mode", async ({
  page,
}) => {
  await page.goto("/books");
  await page.getByRole("button", { name: "追加", exact: true }).click();
  await page.getByLabel("書名").fill("Atomic demo");
  for (const name of ["Demo A", "Demo B"]) {
    await page.getByPlaceholder("著者を検索").fill(name);
    await page.getByRole("option", { name: `+ Create ${name}` }).click();
  }
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "追加", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "書籍追加" })).toBeHidden();
  await page.getByRole("link", { name: "Atomic demo", exact: true }).click();
  await expect(
    page.getByTestId("book-detail").getByText("Demo A", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("book-detail").getByText("Demo B", { exact: true }),
  ).toBeVisible();
});
