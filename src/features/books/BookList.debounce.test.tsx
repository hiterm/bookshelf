import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAuthors } from "../authors/api/useAuthors";
import { BookList } from "./BookList";
import { bookSearchSchema } from "./bookSearch";
import type { Book } from "./entity/Book";

vi.mock(import("../authors/api/useAuthors"));

vi.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mocked(useAuthors, { partial: true }).mockReturnValue({
  data: { authors: [] },
  isLoading: false,
  error: null,
});

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
const books: Book[] = [1, 2].map((number) => ({
  id: `book-${String(number)}`,
  title: `テスト書籍${String(number)}`,
  authors: [],
  isbn: `978-4-00-00000${String(number)}-0`,
  read: false,
  owned: true,
  priority: number,
  format: "PRINTED",
  store: "UNKNOWN",
  purchaseDate: null,
  createdAt: now,
  updatedAt: now,
}));

test("title filter debounces through the table and Router", async () => {
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
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      booksRoute.addChildren([booksIndexRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: ["/books"] }),
  });
  await router.load();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  vi.useFakeTimers();
  try {
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MantineProvider env="test">
            <RouterProvider router={router} />
          </MantineProvider>
        </QueryClientProvider>,
      );
      await Promise.resolve();
    });

    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    expect(router.state.location.search.columnFilters).toBeUndefined();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(router.state.location.search.columnFilters).toBeUndefined();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(router.state.location.search.columnFilters).toEqual([
      { id: "title", value: "書籍1" },
    ]);
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
