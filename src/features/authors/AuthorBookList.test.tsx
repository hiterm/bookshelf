import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import type { AuthorQuery } from "../../generated/graphql-request";
import { AuthorBookList } from "./AuthorBookList";

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

  global.ResizeObserver = class ResizeObserver {
    // No-op stub: DOM layout is not needed in this unit test.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {}
    // No-op stub: DOM layout is not needed in this unit test.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // No-op stub: DOM layout is not needed in this unit test.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  };
});

vi.mock("../../compoments/mantineTsr", () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params: { id: string };
  }) => <a href={to.replace("$id", params.id)}>{children}</a>,
}));

type Books = NonNullable<AuthorQuery["author"]>["books"];

const books: Books = [
  {
    id: "book-1",
    title: "関連書籍1",
    isbn: "978-4-00-000001-0",
    format: "PRINTED",
    read: true,
    owned: false,
  },
  {
    id: "book-2",
    title: "関連書籍2",
    isbn: "978-4-00-000002-7",
    format: "E_BOOK",
    read: false,
    owned: true,
  },
];

const renderList = (list: Books) => {
  render(<AuthorBookList books={list} />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });
};

test("displays books returned for the author in API order", () => {
  renderList(books);

  const rows = screen.getAllByRole("row").slice(1);
  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getByText("関連書籍1")).toBeInTheDocument();
  expect(within(rows[1]).getByText("関連書籍2")).toBeInTheDocument();
  expect(rows[0]).toHaveTextContent("978-4-00-000001-0");
  expect(rows[0]).toHaveTextContent("Printed");
  expect(rows[1]).toHaveTextContent("978-4-00-000002-7");
  expect(rows[1]).toHaveTextContent("eBook");

  expect(screen.getByRole("link", { name: "関連書籍1" })).toHaveAttribute(
    "href",
    "/books/book-1",
  );
});

test("displays an empty state when the author has no books", () => {
  renderList([]);

  expect(screen.getByText("この著者の本はありません")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
