import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as routerActual from "@tanstack/react-router" with {
  rstest: "importActual",
};
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { rs } from "@rstest/core";
import type {
  UpdateAuthorInput,
  UpdateAuthorMutation,
} from "../../generated/graphql-request";
import { mutationIdle } from "../../test/reactQueryResults";
import { useUpdateAuthor } from "./api/useUpdateAuthor";
import { AppErrorProvider } from "../../components/errors/AppErrorProvider";
import { AuthorEdit } from "./AuthorEdit";

rs.mock("@tanstack/react-router", () => ({
  ...routerActual,
  useNavigate: () => rs.fn().mockResolvedValue(undefined),
}));

const mockMutateAsync = rs
  .fn<ReturnType<typeof useUpdateAuthor>["mutateAsync"]>()
  .mockResolvedValue({
    updateAuthor: {
      author: { id: "author-1", name: "テスト著者", yomi: "てすとちょしゃ" },
    },
  });

rs.mock(import("./api/useUpdateAuthor"));
rs.mocked(useUpdateAuthor).mockReturnValue(
  mutationIdle<UpdateAuthorMutation, UpdateAuthorInput>({
    mutateAsync: mockMutateAsync,
  }),
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

describe("AuthorEdit", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
    rs.mocked(showNotification).mockClear();
  });

  test("renders inputs with initial values", () => {
    render(<AuthorEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    expect(input).toHaveValue("テスト著者");
    expect(screen.getByRole("textbox", { name: "読み仮名" })).toHaveValue(
      "てすとちょしゃ",
    );
  });

  test("renders Save and Cancel buttons", () => {
    render(<AuthorEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  test("calls updateAuthor mutation with updated values on save", async () => {
    render(<AuthorEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    await userEvent.clear(input);
    await userEvent.type(input, "更新された著者");
    const yomiInput = screen.getByRole("textbox", { name: "読み仮名" });
    await userEvent.clear(yomiInput);
    await userEvent.type(yomiInput, "こうしんされたちょしゃ");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: "author-1",
        name: "更新された著者",
        yomi: "こうしんされたちょしゃ",
      });
    });
  });

  test("shows validation error when name is empty", async () => {
    render(<AuthorEdit author={testAuthor} />, {
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

  test("shows validation error when reading is empty", async () => {
    render(<AuthorEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "読み仮名" });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
    expect(
      await screen.findByText("読み仮名を入力してください"),
    ).toBeInTheDocument();
  });

  test("shows error notification when update fails", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));
    render(<AuthorEdit author={testAuthor} />, {
      wrapper: createWrapper(),
    });
    const input = screen.getByRole("textbox", { name: "名前" });
    await userEvent.clear(input);
    await userEvent.type(input, "更新された著者");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith({
        message: "著者の更新に失敗しました",
        color: "red",
      });
    });
  });
});
