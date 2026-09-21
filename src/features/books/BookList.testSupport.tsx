import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  defaultStringifySearch,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import React from "react";
import type { z } from "zod";
import { vi } from "vitest";
import { useAuthors } from "../authors/api/useAuthors";
import { BookList } from "./BookList";
import { bookSearchSchema } from "./bookSearch";
import type { Book } from "./entity/Book";

type BookSearch = {
  columnFilters?: { id: string; value: unknown }[];
  sorting?: { id: string; desc: boolean }[];
  pageIndex?: number;
  pageSize?: 20 | 50 | 100;
};

vi.mock(import("../authors/api/useAuthors"));

vi.mocked(useAuthors, { partial: true }).mockReturnValue({
  data: {
    authors: [
      { id: "author-1", name: "著者1", yomi: "ちょしゃいち" },
      { id: "author-2", name: "著者2", yomi: "ちょしゃに" },
    ],
  },
  isLoading: false,
  error: null,
});

vi.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();

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

const now = new Date();

export const testBooks: Book[] = [
  {
    id: "book-1",
    title: "テスト書籍1",
    authors: [{ id: "author-1", name: "著者1", yomi: "ちょしゃいち" }],
    isbn: "978-4-00-000001-0",
    read: false,
    owned: true,
    priority: 50,
    format: "PRINTED",
    store: "UNKNOWN",
    purchaseDate: "2024-01-15",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "book-2",
    title: "テスト書籍2",
    authors: [{ id: "author-2", name: "著者2", yomi: "ちょしゃに" }],
    isbn: "978-4-00-000002-7",
    read: true,
    owned: true,
    priority: 80,
    format: "E_BOOK",
    store: "KINDLE",
    purchaseDate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "book-3",
    title: "テスト書籍3",
    authors: [{ id: "author-1", name: "著者1", yomi: "ちょしゃいち" }],
    isbn: "978-4-00-000003-4",
    read: false,
    owned: false,
    priority: 30,
    format: "UNKNOWN",
    store: "UNKNOWN",
    purchaseDate: "2024-03-20",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "book-4",
    title: "テスト書籍4",
    authors: [{ id: "author-2", name: "著者2", yomi: "ちょしゃに" }],
    isbn: "978-4-00-000004-1",
    read: true,
    owned: false,
    priority: 10,
    format: "E_BOOK",
    store: "KINDLE",
    purchaseDate: "2024-02-10",
    createdAt: now,
    updatedAt: now,
  },
];

export const createBooks = (count: number): Book[] =>
  Array.from({ length: count }, (_, index) => ({
    ...testBooks[index % testBooks.length],
    id: `book-${String(index + 1)}`,
    title: `テスト書籍${String(index + 1)}`,
    priority: index + 1,
  }));

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider env="test">{children}</MantineProvider>
    </QueryClientProvider>
  );
  return wrapper;
};

export const renderBookList = async (
  initialSearch: BookSearch = {},
  books: Book[] = testBooks,
): Promise<{
  router: {
    state: { location: { search: BookSearch } };
    navigate: (options: {
      to: "/books";
      search: z.infer<typeof bookSearchSchema>;
    }) => Promise<void>;
  };
}> => {
  const rootRoute = createRootRoute({ component: Outlet });
  const booksRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "books",
    component: Outlet,
  });
  const booksIndexRoute = createRoute({
    getParentRoute: () => booksRoute,
    path: "/",
    validateSearch: bookSearchSchema,
    component: () => <BookList list={books} />,
  });
  const routeTree = rootRoute.addChildren([
    booksRoute.addChildren([booksIndexRoute]),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [`/books${defaultStringifySearch(initialSearch)}`],
    }),
  });
  await router.load();

  return {
    ...render(<RouterProvider router={router} />, { wrapper: createWrapper() }),
    router,
  };
};
