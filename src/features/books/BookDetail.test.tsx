import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { useDeleteBook } from "./api/useDeleteBook";
import { BookDetail } from "./BookDetail";
import { AppErrorProvider } from "../../components/errors/AppErrorProvider";
import type { Book } from "./entity/Book";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock(import("./api/useDeleteBook"));
vi.mocked(useDeleteBook, { partial: true }).mockReturnValue({
  mutateAsync: vi.fn(),
});

vi.mock("../../components/mantineTsr", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params: { id: string };
  }) => <a href={to.replace("$id", params.id)}>{children}</a>,
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const book: Book = {
  id: "book-1",
  title: "テスト書籍",
  authors: [
    { id: "author-1", name: "山田太郎", yomi: "やまだたろう" },
    { id: "author-2", name: "鈴木花子", yomi: "すずきはなこ" },
  ],
  isbn: "978-4-00-000001-0",
  read: false,
  owned: true,
  priority: 50,
  format: "PRINTED",
  store: "UNKNOWN",
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

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

test("shows authors and author readings as separate items", () => {
  render(<BookDetail book={book} />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <AppErrorProvider>{children}</AppErrorProvider>
      </MantineProvider>
    ),
  });

  const detail = screen.getByTestId("book-detail");
  expect(within(detail).getByText("著者")).toBeInTheDocument();
  const firstAuthorLink = within(detail).getByRole("link", {
    name: "山田太郎",
  });
  const secondAuthorLink = within(detail).getByRole("link", {
    name: "鈴木花子",
  });
  expect(firstAuthorLink).toHaveAttribute("href", "/authors/author-1");
  expect(secondAuthorLink).toHaveAttribute("href", "/authors/author-2");
  expect(firstAuthorLink.parentElement).toBe(secondAuthorLink.parentElement);
  expect(firstAuthorLink.parentElement).toHaveTextContent("山田太郎, 鈴木花子");
  expect(detail).toHaveTextContent("山田太郎, 鈴木花子");
  expect(within(detail).getByText("著者読み仮名")).toBeInTheDocument();
  expect(
    within(detail).getByText("やまだたろう, すずきはなこ"),
  ).toBeInTheDocument();
});
