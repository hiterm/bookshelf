import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { AuthorDetailShow } from "./AuthorDetailShow";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => vi.fn().mockResolvedValue(undefined),
  };
});

const mockMutateAsync = vi.fn().mockResolvedValue({});

vi.mock("../../compoments/hooks/useDeleteAuthor", () => ({
  useDeleteAuthor: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("../../compoments/mantineTsr", () => ({
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    to?: string;
  }) => <a href={props.to}>{children}</a>,
  LinkButton: ({
    children,
    linkOptions,
    ...props
  }: {
    children: React.ReactNode;
    linkOptions: { to: string; params?: Record<string, string> };
  } & React.ComponentProps<"button">) => (
    <a href={linkOptions.to}>
      <button type="button" {...props}>
        {children}
      </button>
    </a>
  ),
}));

vi.mock("@mantine/notifications", () => ({
  showNotification: vi.fn(),
}));

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

const testAuthor = { id: "author-1", name: "テスト著者" };

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

describe("AuthorDetailShow", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  test("renders the author name", () => {
    render(<AuthorDetailShow author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("テスト著者")).toBeInTheDocument();
  });

  test("renders edit and delete buttons", () => {
    render(<AuthorDetailShow author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("button", { name: "変更" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  test("opens delete confirmation modal on delete button click", async () => {
    render(<AuthorDetailShow author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => {
      expect(screen.getByText("削除確認")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト著者を削除しますか？")).toBeInTheDocument();
  });

  test("closes modal on cancel", async () => {
    render(<AuthorDetailShow author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => {
      expect(screen.getByText("削除確認")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => {
      expect(screen.queryByText("削除確認")).not.toBeInTheDocument();
    });
  });

  test("calls deleteAuthor mutation on confirm", async () => {
    render(<AuthorDetailShow author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => {
      expect(screen.getByText("削除確認")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "削除する" }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith("author-1");
    });
  });
});
