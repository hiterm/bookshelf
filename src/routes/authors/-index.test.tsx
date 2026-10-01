import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { AppErrorProvider } from "../../components/errors/AppErrorProvider";
import { ErrorPanel } from "../../components/errors/ErrorPanel";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { useCreateAuthor } from "../../features/authors/api/useCreateAuthor";
import { useAuthors } from "../../features/authors/api/useAuthors";
import { AuthorIndexPage } from "./index";

vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

vi.mock(import("../../features/authors/api/useCreateAuthor"));
vi.mock(import("../../features/authors/api/useAuthors"));

vi.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const authors = Array.from({ length: 11 }, (_, index) => ({
  id: `author-${String(index + 1)}`,
  name: `著者${String(index + 1)}`,
  yomi: `ちょしゃ${String(index + 1)}`,
}));

vi.mocked(useAuthors, { partial: true }).mockReturnValue({
  data: { authors },
  isLoading: false,
  error: null,
});

vi.mocked(useCreateAuthor, { partial: true }).mockReturnValue({
  mutateAsync: vi.fn(),
  isPending: false,
});

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

const renderPage = (): ReturnType<typeof render> =>
  render(<AuthorIndexPage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <AppErrorProvider queryClient={new QueryClient()}>
          <ErrorPanel />
          {children}
        </AppErrorProvider>
      </MantineProvider>
    ),
  });

describe("AuthorIndexPage table features", () => {
  test("displays authors", () => {
    renderPage();

    expect(screen.getByText("著者1")).toBeInTheDocument();
    expect(screen.getByText("ちょしゃ1")).toBeInTheDocument();
  });

  test("filters authors by the global search", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("検索..."), {
      target: { value: "著者11" },
    });

    await waitFor(() => {
      expect(screen.getByText("著者11")).toBeInTheDocument();
    });
    expect(screen.queryByText("著者1")).not.toBeInTheDocument();
  });

  test("paginates authors", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(screen.getByText("著者11")).toBeInTheDocument();
    });
    expect(screen.queryByText("著者1")).not.toBeInTheDocument();
  });
});

test("retains author registration input and reports a failed attempt once before retry", async () => {
  const mutateAsync = vi
    .fn()
    .mockRejectedValueOnce(new Error("Registration rejected"))
    .mockResolvedValueOnce({});
  vi.mocked(showNotification).mockClear();
  vi.mocked(useCreateAuthor, { partial: true }).mockReturnValue({
    mutateAsync,
    isPending: false,
  });
  renderPage();
  fireEvent.change(screen.getByRole("textbox", { name: "名前" }), {
    target: { value: "Retry author" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "読み仮名" }), {
    target: { value: "りとらい" },
  });
  const register = screen.getByRole("button", { name: "登録" });
  fireEvent.click(register);
  await waitFor(() =>
    expect(screen.getByText("著者の登録に失敗しました")).toBeInTheDocument(),
  );
  expect(screen.getByRole("textbox", { name: "名前" })).toHaveValue(
    "Retry author",
  );
  expect(screen.getByRole("textbox", { name: "読み仮名" })).toHaveValue(
    "りとらい",
  );
  expect(showNotification).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  fireEvent.click(register);
  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });
  expect(mutateAsync).toHaveBeenLastCalledWith({
    name: "Retry author",
    yomi: "りとらい",
  });
  expect(showNotification).toHaveBeenCalledTimes(1);
});

test("shows a normalized local author query failure", () => {
  vi.mocked(useAuthors, { partial: true }).mockReturnValueOnce({
    data: undefined,
    isLoading: false,
    error: new Error("Authors unavailable"),
  });
  renderPage();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "著者の読み込みに失敗しました",
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Authors unavailable");
});
