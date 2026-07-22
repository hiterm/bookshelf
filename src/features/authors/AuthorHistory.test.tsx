import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { AuthorHistory } from "./AuthorHistory";

const mockUseAuthorEvents = vi.fn();

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

vi.mock("../../compoments/hooks/useAuthorEvents", () => ({
  useAuthorEvents: (...args: unknown[]) =>
    mockUseAuthorEvents(...args) as unknown,
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

const mockEvents = {
  authorEvents: [
    {
      eventId: "event-1",
      eventSetId: "set-1",
      operation: "CREATE",
      authorId: "author-1",
      name: "著者1",
      yomi: null,
      authorCreatedAt: 1609459200,
      authorUpdatedAt: 1609459200,
      changedAt: 1609459200,
      extra: null,
    },
  ],
};

describe("AuthorHistory", () => {
  beforeEach(() => {
    mockUseAuthorEvents.mockReset();
  });

  test("renders history table with events", () => {
    mockUseAuthorEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole("heading", { name: "History" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("著者1")).toBeInTheDocument();
  });

  test("opens modal with event details on row click", async () => {
    mockUseAuthorEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    await userEvent.click(
      screen.getByRole("button", { name: "View event detail" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Event Detail")).toBeInTheDocument();
    expect(screen.getByText("Operation:")).toBeInTheDocument();
    expect(screen.getByText("Name:")).toBeInTheDocument();
  });

  test("renders nothing when no events exist", () => {
    mockUseAuthorEvents.mockReturnValue({
      data: { authorEvents: [] },
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.queryByRole("heading", { name: "History" }),
    ).not.toBeInTheDocument();
  });

  test("renders loading state", () => {
    mockUseAuthorEvents.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders error state", () => {
    mockUseAuthorEvents.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("fail"),
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Error loading history")).toBeInTheDocument();
  });

  test("renders UPDATE and DELETE operations", () => {
    const eventsWithMultipleOperations = {
      authorEvents: [
        {
          eventId: "event-1",
          eventSetId: "set-1",
          operation: "CREATE",
          authorId: "author-1",
          name: "著者1",
          yomi: null,
          authorCreatedAt: 1609459200,
          authorUpdatedAt: 1609459200,
          changedAt: 1609459200,
          extra: null,
        },
        {
          eventId: "event-2",
          eventSetId: "set-2",
          operation: "UPDATE",
          authorId: "author-1",
          name: "更新著者1",
          yomi: null,
          authorCreatedAt: 1609459200,
          authorUpdatedAt: 1609459300,
          changedAt: 1609459300,
          extra: null,
        },
        {
          eventId: "event-3",
          eventSetId: "set-3",
          operation: "DELETE",
          authorId: "author-1",
          name: "更新著者1",
          yomi: null,
          authorCreatedAt: 1609459200,
          authorUpdatedAt: 1609459300,
          changedAt: 1609459400,
          extra: null,
        },
      ],
    };

    mockUseAuthorEvents.mockReturnValue({
      data: eventsWithMultipleOperations,
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("DELETE")).toBeInTheDocument();
  });

  test("displays events in descending order by changedAt", () => {
    const eventsWithOrder = {
      authorEvents: [
        {
          eventId: "event-2",
          eventSetId: "set-2",
          operation: "UPDATE",
          authorId: "author-1",
          name: "更新著者1",
          yomi: null,
          authorCreatedAt: 1609459200,
          authorUpdatedAt: 1609459300,
          changedAt: 1609459300,
          extra: null,
        },
        {
          eventId: "event-1",
          eventSetId: "set-1",
          operation: "CREATE",
          authorId: "author-1",
          name: "著者1",
          yomi: null,
          authorCreatedAt: 1609459200,
          authorUpdatedAt: 1609459200,
          changedAt: 1609459200,
          extra: null,
        },
      ],
    };

    mockUseAuthorEvents.mockReturnValue({
      data: eventsWithOrder,
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    const rows = screen.getAllByRole("row");
    const dataRows = rows.filter((row) => row.querySelector("th") == null);
    expect(dataRows[0]).toHaveTextContent("UPDATE");
    expect(dataRows[1]).toHaveTextContent("CREATE");
  });

  test("formats date as YYYY/MM/DD HH:mm:ss", () => {
    mockUseAuthorEvents.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    });

    render(<AuthorHistory authorId="author-1" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("2021/01/01 00:00:00")).toBeInTheDocument();
  });
});
