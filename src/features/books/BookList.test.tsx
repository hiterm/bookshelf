import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { BookList } from "./BookList";
import type { Book } from "./entity/Book";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    getRouteApi: () => ({
      useSearch: () => ({}),
      useNavigate: () => vi.fn().mockResolvedValue(undefined),
    }),
  };
});

vi.mock("../../compoments/hooks/useAuthors", () => ({
  useAuthors: () => ({
    data: {
      authors: [
        { id: "author-1", name: "著者1" },
        { id: "author-2", name: "著者2" },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

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
    authors: [{ id: "author-1", name: "著者1" }],
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
    authors: [{ id: "author-2", name: "著者2" }],
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
    authors: [{ id: "author-1", name: "著者1" }],
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
    authors: [{ id: "author-2", name: "著者2" }],
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

const renderBookList = () =>
  render(<BookList list={testBooks} />, { wrapper: createWrapper() });

describe("BookList filters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows all books initially", async () => {
    renderBookList();
    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("title string filter shows only matching books", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await act(async () => {
      vi.advanceTimersByTime(1100);
      await Promise.resolve();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();

    vi.useRealTimers();
  });

  test("ISBN string filter shows only matching books", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const isbnInput = within(screen.getByTestId("filter-isbn")).getByRole(
      "textbox",
    );
    fireEvent.change(isbnInput, { target: { value: "000002" } });

    await act(async () => {
      vi.advanceTimersByTime(1100);
      await Promise.resolve();
    });

    expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();

    vi.useRealTimers();
  });

  test("read filter = true shows only read books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-read")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "true" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("read filter = false shows only unread books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-read")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "false" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
  });

  test("owned filter = true shows only owned books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-owned")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "true" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
  });

  test("format filter = PRINTED shows only printed books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-format")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "Printed" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.queryByText("テスト書籍4")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  });

  test("format filter = E_BOOK shows only eBook books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-format")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "eBook" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("store filter = KINDLE shows only Kindle books", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-store")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "Kindle" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍1")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("テスト書籍3")).not.toBeInTheDocument();
    expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("authors filter shows only books by selected author", async () => {
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId("filter-authors")).getByRole("textbox"),
    );
    await userEvent.click(screen.getByRole("option", { name: "著者1" }));

    await waitFor(() => {
      expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();
    });
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
    if (!el) throw new Error(`Header text "${name}" not found in thead`);
    return el;
  };

  test("sort priority descending puts highest priority first", async () => {
    const user = userEvent.setup();
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("優先度"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody"));
      expect(within(bodyRows[0]).getByText("テスト書籍2")).toBeInTheDocument();
    });
  });

  test("sort priority ascending puts lowest priority first", async () => {
    const user = userEvent.setup();
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const priorityText = getHeaderText("優先度");
    await user.click(priorityText); // → desc
    await user.click(priorityText); // → asc

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody"));
      expect(within(bodyRows[0]).getByText("テスト書籍4")).toBeInTheDocument();
    });
  });

  test("sort title ascending puts テスト書籍1 first", async () => {
    const user = userEvent.setup();
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    await user.click(getHeaderText("書名"));

    await waitFor(() => {
      const bodyRows = screen
        .getAllByRole("row")
        .filter((r) => r.closest("tbody"));
      expect(within(bodyRows[0]).getByText("テスト書籍1")).toBeInTheDocument();
    });
  });
});

describe("BookList preset and reset", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("preset filter shows only unread owned books", async () => {
    renderBookList();

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
  });

  test("reset filter restores all books", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await act(async () => {
      vi.advanceTimersByTime(1100);
      await Promise.resolve();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();

    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(screen.getByText("テスト書籍2")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍3")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍4")).toBeInTheDocument();
  });

  test("reset filter clears the title input", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
    });

    const titleInput = within(screen.getByTestId("filter-title")).getByRole(
      "textbox",
    );
    fireEvent.change(titleInput, { target: { value: "書籍1" } });

    await act(async () => {
      vi.advanceTimersByTime(1100);
      await Promise.resolve();
    });

    expect(screen.queryByText("テスト書籍2")).not.toBeInTheDocument();

    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });
});
