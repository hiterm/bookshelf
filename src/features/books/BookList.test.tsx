import "@testing-library/jest-dom";
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
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { BookList } from "./BookList";
import { bookSearchSchema } from "./bookSearch";
import type { Book } from "./entity/Book";

type BookSearch = {
  columnFilters?: { id: string; value: unknown }[];
  sorting?: { id: string; desc: boolean }[];
  pageIndex?: number;
  pageSize?: 20 | 50 | 100;
};

vi.mock(import("../../compoments/hooks/useAuthors"));

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

vi.mock("../../compoments/mantineTsr", () => ({
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

const testBooks: Book[] = [
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
    createdAt: now,
    updatedAt: now,
  },
];

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

const renderBookList = async (initialSearch: BookSearch = {}) => {
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
    component: () => <BookList list={testBooks} />,
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

describe("BookList filters", () => {
  test("shows all books initially", async () => {
    await renderBookList();
    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("shows author readings in an independent column", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: "著者読み仮名" }),
      ).toBeInTheDocument();
    });
    const row = screen.getByRole("row", { name: /テスト書籍1/ });
    expect(within(row).getByText("ちょしゃいち")).toBeInTheDocument();
  });

  test("uses column filters from route search", async () => {
    await renderBookList({
      columnFilters: [{ id: "title", value: "書籍2" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
  });

  test("reacts to route search changes after rendering", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate({
        to: "/books",
        search: { columnFilters: [{ id: "read", value: true }] },
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("title string filter shows only matching books", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(router.state.location.search.columnFilters).toEqual([
      { id: "title", value: "書籍1" },
    ]);
  });

  test("ISBN string filter shows only matching books", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const isbnInput = within(screen.getByTestId("filter-isbn")).getByRole(
      "textbox",
    );
    fireEvent.change(isbnInput, { target: { value: "000002" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
  });

  test("read filter = true shows only read books", async () => {
    await renderBookList({ columnFilters: [{ id: "read", value: true }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("read filter = false shows only unread books", async () => {
    await renderBookList({ columnFilters: [{ id: "read", value: false }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });

  test("owned filter = true shows only owned books", async () => {
    await renderBookList({ columnFilters: [{ id: "owned", value: true }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
  });

  test("format filter = PRINTED shows only printed books", async () => {
    await renderBookList({
      columnFilters: [{ id: "format", value: "PRINTED" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  });

  test("format filter = E_BOOK shows only eBook books", async () => {
    await renderBookList({
      columnFilters: [{ id: "format", value: "E_BOOK" }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("store filter = KINDLE shows only Kindle books", async () => {
    await renderBookList({ columnFilters: [{ id: "store", value: "KINDLE" }] });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("authors filter shows only books by selected author", async () => {
    await renderBookList({
      columnFilters: [{ id: "authors", value: ["author-1"] }],
    });

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });
});

describe("BookList sorting", () => {
  // The sort onClick is on the inner Group div, not the <th>.
  // Clicking the text element itself bubbles up to the Group handler.
  const getHeaderText = (name: string) => {
    const el = screen
      .getAllByText(name)
      .find((e) => e.closest("thead") !== null);
    if (el == null) {
      throw new Error(`Header text "${name}" not found in thead`);
    }
    return el;
  };

  test("sort priority descending puts highest priority first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("優先度"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍2")).toBeInTheDocument();
    });
  });

  test("sort priority ascending puts lowest priority first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const priorityText = getHeaderText("優先度");
    await user.click(priorityText); // → desc
    await user.click(priorityText); // → asc

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍4")).toBeInTheDocument();
    });
  });

  test("sort title ascending puts テスト書籍1 first", async () => {
    const user = userEvent.setup();
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("書名"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody") != null);
      expect(within(bodyRows[0]).getByText("テスト書籍1")).toBeInTheDocument();
    });
  });

  test("sorting resets the URL page index", async () => {
    const user = userEvent.setup();
    const { router } = await renderBookList({ pageIndex: 2 });

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: /優先度/ }),
      ).toBeVisible();
    });

    await user.click(getHeaderText("優先度"));

    await waitFor(() => {
      expect(router.state.location.search.sorting).toEqual([
        { id: "priority", desc: true },
      ]);
    });
    expect(router.state.location.search.pageIndex).toBeUndefined();
  });
});

describe("BookList preset and reset", () => {
  test("preset filter shows only unread owned books", async () => {
    const { router } = await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    // fireEvent opens the Mantine Menu reliably in jsdom (user.click fires
    // pointer events that the Menu's internal handler may not catch).
    fireEvent.click(screen.getByRole("button", { name: "Preset filters" }));

    await waitFor(() => {
      expect(
        screen.getByText("Unread owned, order by priority"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Unread owned, order by priority"));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      columnFilters: [
        { id: "read", value: false },
        { id: "owned", value: true },
      ],
      sorting: [{ id: "priority", desc: true }],
    });
    expect(router.state.location.search.pageIndex).toBeUndefined();
  });

  test("reset filter restores all books", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("reset filter clears the title input", async () => {
    await renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await waitFor(
      () => {
        expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });
});
