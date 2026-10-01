import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";

const rejectNextOperation = async (
  page: Page,
  operation: string,
): Promise<void> => {
  let rejected = false;
  await page.route("http://localhost:4000/graphql", async (route) => {
    const body: unknown = route.request().postDataJSON();
    if (
      !rejected &&
      typeof body === "object" &&
      body != null &&
      "query" in body &&
      typeof body.query === "string" &&
      body.query.includes(operation)
    ) {
      rejected = true;
      await route.fulfill({
        status: 200,
        json: {
          errors: [
            {
              message: "Registration rejected",
              extensions: {
                code: "REGISTRATION_REJECTED",
                token: "extension-secret",
                variables: "response-variable-secret",
              },
            },
          ],
        },
      });
      return;
    }
    await route.fallback();
  });
};

const expectSingleReport = async (
  page: Page,
  title: string,
  operation: string,
): Promise<void> => {
  const panel = page.getByTestId("persistent-error-panel");
  await expect(panel.getByRole("alert")).toHaveCount(1);
  await expect(panel.getByText(title)).toBeVisible();
  await expect(
    page.locator(".mantine-Notification-root").filter({ hasText: title }),
  ).toHaveCount(1);
  await panel.getByRole("button", { name: "詳細を表示" }).click();
  await expect(
    panel.getByText(new RegExp(`Operation: ${operation}`)),
  ).toBeVisible();
  await expect(panel.getByText(/Message: Registration rejected/)).toBeVisible();
  await expect(panel).not.toContainText("extension-secret");
  await expect(panel).not.toContainText("response-variable-secret");
  await expect(panel).not.toContainText("Authorization");
};

test("author registration reports once, retains values, and succeeds on retry", async ({
  page,
}) => {
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  await page.getByRole("link", { name: "著者", exact: true }).click();
  const register = page.getByRole("button", { name: "登録", exact: true });
  await expect(register).toBeVisible();
  await rejectNextOperation(page, "mutation createAuthor");
  await page
    .getByRole("textbox", { name: "名前", exact: true })
    .fill("再試行著者");
  await page
    .getByRole("textbox", { name: "読み仮名" })
    .fill("さいしこうちょしゃ");
  await register.click();
  await expectSingleReport(page, "著者の登録に失敗しました", "CreateAuthor");
  await expect(register).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "名前", exact: true }),
  ).toHaveValue("再試行著者");
  await expect(page.getByRole("textbox", { name: "読み仮名" })).toHaveValue(
    "さいしこうちょしゃ",
  );
  await register.click();
  await expect(
    page.getByRole("link", { name: "再試行著者", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("persistent-error-panel").getByRole("alert"),
  ).toHaveCount(1);
});

test("author validation stays local without a mutation request", async ({
  page,
}) => {
  let creates = 0;
  await page.route("http://localhost:4000/graphql", async (route) => {
    const body: unknown = route.request().postDataJSON();
    if (
      typeof body === "object" &&
      body != null &&
      "query" in body &&
      typeof body.query === "string" &&
      body.query.includes("mutation createAuthor")
    )
      creates += 1;
    await route.fallback();
  });
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
  await page.getByRole("link", { name: "著者", exact: true }).click();
  await page.getByRole("button", { name: "登録", exact: true }).click();
  await expect(page.getByText("Please enter a valid name")).toBeVisible();
  expect(creates).toBe(0);
  await expect(page.getByTestId("persistent-error-panel")).toHaveCount(0);
  await expect(page.locator(".mantine-Notification-root")).toHaveCount(0);
});

test.describe("New user registration failures", () => {
  test.use({ isNewUser: true });

  test("handles rejection, reports once, and allows retry", async ({
    page,
  }) => {
    const unhandled: string[] = [];
    page.on("pageerror", (error) => unhandled.push(error.message));
    await rejectNextOperation(page, "mutation registerUser");
    await page.goto("/books");
    await page.getByRole("button", { name: "Login" }).click();
    const register = page.getByRole("button", { name: "Register user" });
    await register.click();
    await expectSingleReport(
      page,
      "ユーザーの登録に失敗しました",
      "RegisterUser",
    );
    await expect(register).toBeEnabled();
    await register.click();
    await expect(page.getByRole("link", { name: "テスト書籍1" })).toBeVisible();
    await expect(
      page.getByTestId("persistent-error-panel").getByRole("alert"),
    ).toHaveCount(1);
    expect(unhandled).toEqual([]);
  });
});

test("query failure keeps safe local UI alongside a single persistent report", async ({
  page,
}) => {
  const rawErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") rawErrors.push(message.text());
  });
  await rejectNextOperation(page, "query books");
  await page.goto("/books");
  await page.getByRole("button", { name: "Login" }).click();
  const panel = page.getByTestId("persistent-error-panel");
  await expect(panel.getByRole("alert")).toHaveCount(1);
  const local = page
    .getByRole("alert")
    .filter({ hasText: "書籍の読み込みに失敗しました" });
  await expect(local).toBeVisible();
  await expect(local).toContainText("Registration rejected");
  await expect(local).not.toContainText("extension-secret");
  await expect(local).not.toContainText("response-variable-secret");
  await expect(local).not.toContainText("query books");
  await expect(page.locator(".mantine-Notification-root")).toHaveCount(1);
  await panel.getByRole("button", { name: "詳細を表示" }).click();
  await expect(panel.getByText(/Operation: Query/)).toBeVisible();
  await expect(panel).not.toContainText("extension-secret");
  await expect(panel).not.toContainText("response-variable-secret");
  expect(rawErrors).toEqual([]);
});
