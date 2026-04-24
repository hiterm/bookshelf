import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { AuthorDetailEdit } from "./AuthorDetailEdit";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => vi.fn().mockResolvedValue(undefined),
  };
});

const mockMutateAsync = vi.fn().mockResolvedValue({});

vi.mock("../../compoments/hooks/useUpdateAuthor", () => ({
  useUpdateAuthor: () => ({
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
    <button type="button" data-to={linkOptions.to} {...props}>
      {children}
    </button>
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

describe("AuthorDetailEdit", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
    vi.mocked(showNotification).mockClear();
  });

  test("renders name input with initial value", () => {
    render(<AuthorDetailEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    expect(input).toHaveValue("テスト著者");
  });

  test("renders Save and Cancel buttons", () => {
    render(<AuthorDetailEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  test("calls updateAuthor mutation with updated name on save", async () => {
    render(<AuthorDetailEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    await userEvent.clear(input);
    await userEvent.type(input, "更新された著者");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: "author-1",
        name: "更新された著者",
      });
    });
  });

  test("shows validation error when name is empty", async () => {
    render(<AuthorDetailEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
    expect(
      await screen.findByText("Please enter a valid name"),
    ).toBeInTheDocument();
  });

  test("shows error notification when update fails", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));
    render(<AuthorDetailEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    await userEvent.clear(input);
    await userEvent.type(input, "更新された著者");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      const call = vi.mocked(showNotification).mock.calls[0][0];
      expect(call.color).toBe("red");
      expect(call.message).toContain("Network error");
    });
  });
});
