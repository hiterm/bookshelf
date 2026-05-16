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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
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

    await userEvent.click(screen.getByText("CREATE"));

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
});
