import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as routerActual from "@tanstack/react-router" with {
  rstest: "importActual",
};
import { AppErrorProvider } from "../../components/errors/AppErrorProvider";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { rs } from "@rstest/core";
import type { DeleteAuthorMutation } from "../../generated/graphql-request";
import { mutationIdle } from "../../test/reactQueryResults";
import { useDeleteAuthor } from "./api/useDeleteAuthor";
import { AuthorDetail } from "./AuthorDetail";

rs.mock("@tanstack/react-router", () => ({
  ...routerActual,
  useNavigate: () => rs.fn().mockResolvedValue(undefined),
}));

const mockMutateAsync = rs
  .fn<ReturnType<typeof useDeleteAuthor>["mutateAsync"]>()
  .mockResolvedValue({ deleteAuthor: { authorId: "author-1" } });

rs.mock(import("./api/useDeleteAuthor"));
rs.mocked(useDeleteAuthor).mockReturnValue(
  mutationIdle<DeleteAuthorMutation, string>({ mutateAsync: mockMutateAsync }),
);

rs.mock("../../components/mantineTsr", () => ({
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
    leftSection: _leftSection,
    rightSection: _rightSection,
    ...props
  }: {
    children: React.ReactNode;
    linkOptions: { to: string; params?: Record<string, string> };
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
  } & React.ComponentProps<"button">) => (
    <button type="button" data-to={linkOptions.to} {...props}>
      {children}
    </button>
  ),
}));

rs.mock("@mantine/notifications", () => ({
  showNotification: rs.fn(),
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: rs.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: rs.fn(),
      removeListener: rs.fn(),
      addEventListener: rs.fn(),
      removeEventListener: rs.fn(),
      dispatchEvent: rs.fn(),
    })),
  });
});

const testAuthor = {
  id: "author-1",
  name: "テスト著者",
  yomi: "てすとちょしゃ",
  books: [],
};

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider env="test">
        <AppErrorProvider queryClient={queryClient}>
          {children}
        </AppErrorProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
  return wrapper;
};

describe("AuthorDetail", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  test("renders the author name", () => {
    render(<AuthorDetail author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(
      screen.getByRole("heading", { name: "テスト著者" }),
    ).toBeInTheDocument();
    expect(screen.getByText("てすとちょしゃ")).toBeInTheDocument();
  });

  test("renders edit and delete buttons", () => {
    render(<AuthorDetail author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("button", { name: "変更" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  test("opens delete confirmation modal on delete button click", async () => {
    render(<AuthorDetail author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => {
      expect(screen.getByText("削除確認")).toBeInTheDocument();
    });
    expect(screen.getByText("テスト著者を削除しますか？")).toBeInTheDocument();
  });

  test("closes modal on cancel", async () => {
    render(<AuthorDetail author={testAuthor} />, {
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
    render(<AuthorDetail author={testAuthor} />, {
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
