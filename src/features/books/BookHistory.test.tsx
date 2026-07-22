import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { useBookEvents } from "../../compoments/hooks/useBookEvents";
import type { BookEventsQuery } from "../../generated/graphql-request";
import { BookHistory } from "./BookHistory";

vi.mock(import("../../compoments/hooks/useBookEvents"));

const mockUseBookEvents = vi.mocked(useBookEvents, { partial: true });

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
    // No-op stub: DOM layout/ResizeObserver behavior is not needed in unit tests and no side effects are expected.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {}
    // No-op stub: DOM layout/ResizeObserver behavior is not needed in unit tests and no side effects are expected.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // No-op stub: DOM layout/ResizeObserver behavior is not needed in unit tests and no side effects are expected.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  };
});

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

const mockAuthors = [
  { id: "author-1", name: "著者1", yomi: "ちょしゃいち" },
  { id: "author-2", name: "著者2", yomi: "ちょしゃに" },
];

const mockEvents: BookEventsQuery = {
  bookEvents: [
    {
      eventId: "event-1",
      eventSetId: "set-1",
      operation: "CREATE",
      bookId: "book-1",
      title: "テスト書籍1",
      authorIds: ["author-1"],
      isbn: "978-4-00-000001-0",
      read: false,
      owned: true,
      priority: 50,
      format: "PRINTED",
      store: "UNKNOWN",
      bookCreatedAt: 1609459200,
      bookUpdatedAt: 1609459200,
      changedAt: 1609459200,
      extra: null,
    },
  ],
};

describe("BookHistory", () => {
  beforeEach(() => {
    mockUseBookEvents.mockReset();
  });

  test("renders history table with events", () => {
    mockUseBookEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole("heading", { name: "History" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  });

  test("opens modal with event details on row click", async () => {
    mockUseBookEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    await userEvent.click(
      screen.getByRole("button", { name: "View event detail" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Event Detail")).toBeInTheDocument();
    expect(screen.getByText("Operation:")).toBeInTheDocument();
    expect(screen.getByText("978-4-00-000001-0")).toBeInTheDocument();
    expect(screen.getByText("PRINTED")).toBeInTheDocument();
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  test("renders nothing when no events exist", () => {
    mockUseBookEvents.mockReturnValue({
      data: { bookEvents: [] },
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.queryByRole("heading", { name: "History" }),
    ).not.toBeInTheDocument();
  });

  test("renders loading state", () => {
    mockUseBookEvents.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders error state", () => {
    mockUseBookEvents.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("fail"),
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Error loading history")).toBeInTheDocument();
  });

  test("renders UPDATE and DELETE operations", () => {
    const eventsWithMultipleOperations: BookEventsQuery = {
      bookEvents: [
        {
          eventId: "event-1",
          eventSetId: "set-1",
          operation: "CREATE",
          bookId: "book-1",
          title: "テスト書籍1",
          authorIds: ["author-1"],
          isbn: "978-4-00-000001-0",
          read: false,
          owned: true,
          priority: 50,
          format: "PRINTED",
          store: "UNKNOWN",
          bookCreatedAt: 1609459200,
          bookUpdatedAt: 1609459200,
          changedAt: 1609459200,
          extra: null,
        },
        {
          eventId: "event-2",
          eventSetId: "set-2",
          operation: "UPDATE",
          bookId: "book-1",
          title: "更新テスト書籍1",
          authorIds: ["author-1"],
          isbn: "978-4-00-000001-0",
          read: true,
          owned: true,
          priority: 60,
          format: "PRINTED",
          store: "UNKNOWN",
          bookCreatedAt: 1609459200,
          bookUpdatedAt: 1609459300,
          changedAt: 1609459300,
          extra: null,
        },
        {
          eventId: "event-3",
          eventSetId: "set-3",
          operation: "DELETE",
          bookId: "book-1",
          title: "更新テスト書籍1",
          authorIds: ["author-1"],
          isbn: "978-4-00-000001-0",
          read: true,
          owned: true,
          priority: 60,
          format: "PRINTED",
          store: "UNKNOWN",
          bookCreatedAt: 1609459200,
          bookUpdatedAt: 1609459300,
          changedAt: 1609459400,
          extra: null,
        },
      ],
    };

    mockUseBookEvents.mockReturnValue({
      data: eventsWithMultipleOperations,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("DELETE")).toBeInTheDocument();
  });

  test("displays events in descending order by changedAt", () => {
    const eventsWithOrder: BookEventsQuery = {
      bookEvents: [
        {
          eventId: "event-2",
          eventSetId: "set-2",
          operation: "UPDATE",
          bookId: "book-1",
          title: "更新テスト書籍1",
          authorIds: ["author-1"],
          isbn: "978-4-00-000001-0",
          read: true,
          owned: true,
          priority: 60,
          format: "PRINTED",
          store: "UNKNOWN",
          bookCreatedAt: 1609459200,
          bookUpdatedAt: 1609459300,
          changedAt: 1609459300,
          extra: null,
        },
        {
          eventId: "event-1",
          eventSetId: "set-1",
          operation: "CREATE",
          bookId: "book-1",
          title: "テスト書籍1",
          authorIds: ["author-1"],
          isbn: "978-4-00-000001-0",
          read: false,
          owned: true,
          priority: 50,
          format: "PRINTED",
          store: "UNKNOWN",
          bookCreatedAt: 1609459200,
          bookUpdatedAt: 1609459200,
          changedAt: 1609459200,
          extra: null,
        },
      ],
    };

    mockUseBookEvents.mockReturnValue({
      data: eventsWithOrder,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    const rows = screen.getAllByRole("row");
    const dataRows = rows.filter((row) => row.querySelector("th") == null);
    expect(dataRows[0]).toHaveTextContent("UPDATE");
    expect(dataRows[1]).toHaveTextContent("CREATE");
  });

  test("formats date as YYYY/MM/DD HH:mm:ss", () => {
    mockUseBookEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("2021/01/01 00:00:00")).toBeInTheDocument();
  });

  test("resolves author IDs to author names", () => {
    mockUseBookEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<BookHistory bookId="book-1" authors={mockAuthors} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("著者1")).toBeInTheDocument();
  });
});
