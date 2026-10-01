import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { act, render, screen, within } from "@testing-library/react";
import { ClientError } from "graphql-request";
import { GraphQLError } from "graphql";
import { AppErrorProvider } from "./AppErrorProvider";
import { ErrorPanel } from "./ErrorPanel";
import { LocalError } from "./LocalError";

vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => vi.mocked(showNotification).mockClear());

const graphqlError = new ClientError(
  {
    status: 403,
    headers: new Headers({ "set-cookie": "response-cookie-secret" }),
    body: "response-body-secret",
    errors: [
      new GraphQLError("Forbidden", {
        extensions: { token: "extension-secret" },
      }),
    ],
  },
  {
    query: "query SecretRequest { books { id } }",
    variables: { password: "variable-secret" },
  },
);

test("shows only a contextual title and safe GraphQL message without reporting on rerender", () => {
  const client = new QueryClient();
  const view = (): React.JSX.Element => (
    <MantineProvider env="test">
      <AppErrorProvider queryClient={client}>
        <LocalError title="書籍の読み込みに失敗しました" error={graphqlError} />
        <ErrorPanel />
      </AppErrorProvider>
    </MantineProvider>
  );
  const { rerender } = render(view());
  expect(screen.getByRole("alert")).toHaveTextContent(
    "書籍の読み込みに失敗しました",
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Forbidden");
  expect(document.body.textContent).not.toMatch(
    /secret|SecretRequest|variables|403/i,
  );
  rerender(view());
  expect(showNotification).not.toHaveBeenCalled();
  expect(
    screen.queryByTestId("persistent-error-panel"),
  ).not.toBeInTheDocument();
  client.clear();
});

test.each([
  [new Error("Network unavailable"), "Network unavailable"],
  ["plain failure", "plain failure"],
  [{ password: "object-secret" }, "不明なエラーが発生しました"],
  [null, "不明なエラーが発生しました"],
])("normalizes local error %p", (error, message) => {
  render(<LocalError title="読み込み失敗" error={error} />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });
  expect(screen.getByRole("alert")).toHaveTextContent(message);
  expect(document.body.textContent).not.toContain("object-secret");
});

test("retains one shared query report when its local error rerenders", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = (): React.JSX.Element => (
    <MantineProvider env="test">
      <AppErrorProvider queryClient={client}>
        <ErrorPanel />
        <LocalError title="書籍の読み込みに失敗しました" error={graphqlError} />
      </AppErrorProvider>
    </MantineProvider>
  );
  const { rerender } = render(view());
  await act(async () => {
    await expect(
      client.query({
        queryKey: ["failed-books"],
        queryFn: () => Promise.reject(graphqlError),
      }),
    ).rejects.toBe(graphqlError);
  });
  const panel = screen.getByTestId("persistent-error-panel");
  expect(within(panel).getAllByRole("alert")).toHaveLength(1);
  expect(showNotification).toHaveBeenCalledTimes(1);
  rerender(view());
  expect(within(panel).getAllByRole("alert")).toHaveLength(1);
  expect(showNotification).toHaveBeenCalledTimes(1);
  client.clear();
});
