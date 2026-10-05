import { expect } from "@playwright/test";
import { test } from "./fixtures";

for (const mode of ["create", "update"] as const) {
  test(`atomic ${mode} recovers a concurrent author and waits for confirmation`, async ({
    page,
    request,
  }) => {
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("button", { name: "Register user" }).click();
    await expect(
      page.getByRole("button", { name: "追加", exact: true }),
    ).toBeVisible();

    if (mode === "update") {
      await page.getByRole("button", { name: "追加", exact: true }).click();
      await page.getByLabel("書名").fill("Initial");
      await page.getByPlaceholder("著者を検索").fill("Initial author");
      await page
        .getByRole("option", { name: "+ Create Initial author" })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "追加", exact: true })
        .click();
      await page.getByRole("link", { name: "Initial", exact: true }).click();
      await page.getByRole("link", { name: "変更", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "追加", exact: true }).click();
    }
    await page.getByLabel("書名").fill("Atomic recovery");
    const name = `Concurrent-${mode}`;
    const authorInput = page.getByPlaceholder("著者を検索");
    await authorInput.fill(name);
    await page.getByRole("option", { name: `+ Create ${name}` }).click();
    let saves = 0;
    let standaloneCreates = 0;
    await page.route("**/graphql", async (route) => {
      const query = route.request().postData() ?? "";
      if (query.includes("mutation createAuthor")) standaloneCreates += 1;
      if (
        query.includes(
          mode === "create" ? "mutation createBook" : "mutation updateBook",
        )
      ) {
        saves += 1;
        if (saves === 1) {
          const response = await request.post(route.request().url(), {
            headers: {
              authorization: route.request().headers()["authorization"] ?? "",
            },
            data: {
              query:
                "mutation($name: String!) { createAuthor(authorData: {name: $name}) {author {id}} }",
              variables: { name },
            },
          });
          const result: unknown = await response.json();
          expect(result).toHaveProperty("data.createAuthor.author.id");
          expect(result).not.toHaveProperty("errors");
        }
      }
      await route.fallback();
    });
    const save =
      mode === "create"
        ? page
            .getByRole("dialog")
            .getByRole("button", { name: "追加", exact: true })
        : page.getByRole("button", { name: "Save", exact: true });
    await save.click();
    await expect(page.getByText(/書籍はまだ保存されていません/)).toBeVisible();
    await expect(save).toBeEnabled();
    expect(saves).toBe(1);
    expect(standaloneCreates).toBe(0);
    await expect(
      page.getByRole("button", { name: `Edit author ${name}` }),
    ).toHaveCount(0);
    await save.click();
    if (mode === "create")
      await expect(page.getByRole("dialog", { name: "書籍追加" })).toBeHidden();
    else await expect(page).not.toHaveURL(/edit$/);
    expect(saves).toBe(2);
    expect(standaloneCreates).toBe(0);
  });
}
