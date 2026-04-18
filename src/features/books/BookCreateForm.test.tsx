import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { zodResolver } from "mantine-form-zod-resolver";
import React from "react";
import { vi } from "vitest";
import { BookCreateForm } from "./BookCreateForm";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";

vi.mock("../../compoments/hooks/useAuthors", () => ({
  useAuthors: () => ({
    data: {
      authors: [
        { id: "1", name: "name1" },
        { id: "2", name: "name2" },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

const mockLookup = vi.fn();

vi.mock("./useIsbnLookup", () => ({
  useIsbnLookup: () => ({
    state: { status: "idle" },
    lookup: mockLookup,
  }),
}));

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  };
});

const emptyBook: BookFormValues = {
  title: "",
  authors: [{ id: "c156c887-e162-4777-85c9-ec474a666a87", name: "author1" }],
  isbn: "",
  read: false,
  owned: false,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
};

type TestFormProps = { onSubmit: (values: BookFormValues) => void };

const TestForm: React.FC<TestFormProps> = ({ onSubmit }) => {
  const form = useForm({
    initialValues: emptyBook,
    validate: zodResolver(bookFormSchema),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <BookCreateForm form={form} />
      <button type="submit">送信</button>
    </form>
  );
};

const mockMatchMedia = () => {
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
};

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
  return wrapper;
};

describe("BookCreateForm", () => {
  test("renders all form fields", async () => {
    mockMatchMedia();

    const mockSubmit = vi.fn<(values: BookFormValues) => void>();
    const { findByRole } = render(<TestForm onSubmit={mockSubmit} />, {
      wrapper: createWrapper(),
    });

    expect(await findByRole("textbox", { name: "書名" })).toBeInTheDocument();
    expect(await findByRole("textbox", { name: "ISBN" })).toBeInTheDocument();
    expect(await findByRole("checkbox", { name: "既読" })).toBeInTheDocument();
    expect(await findByRole("checkbox", { name: "所有" })).toBeInTheDocument();
    expect(
      await findByRole("button", { name: "自動入力" }),
    ).toBeInTheDocument();
  });

  test("submits with entered title", async () => {
    mockMatchMedia();

    const mockSubmit = vi.fn<(values: BookFormValues) => void>();
    const { getByRole, findByRole } = render(
      <TestForm onSubmit={mockSubmit} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const titleInput = await findByRole("textbox", { name: "書名" });
    await user.type(titleInput, "valid title");

    await user.click(getByRole("button", { name: "送信" }));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: "valid title",
    });
  });

  test("ISBN auto-fill fills title on success", async () => {
    mockMatchMedia();
    mockLookup.mockResolvedValueOnce({
      title: "looked up title",
      authorNames: [],
    });

    const mockSubmit = vi.fn<(values: BookFormValues) => void>();
    const { getByRole, findByRole } = render(
      <TestForm onSubmit={mockSubmit} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const isbnInput = await findByRole("textbox", { name: "ISBN" });
    await user.type(isbnInput, "9784167158064");

    await user.click(getByRole("button", { name: "自動入力" }));

    const titleInput = await findByRole("textbox", { name: "書名" });
    expect(titleInput).toHaveValue("looked up title");
  });
});
