import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { zodResolver } from "mantine-form-zod-resolver";
import React from "react";
import { vi } from "vitest";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { BookUpdateForm } from "./BookUpdateForm";

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

// mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
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
    validateInputOnBlur: true,
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <BookUpdateForm form={form} />
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
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
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

describe("BookUpdateForm", () => {
  test("submits with entered title", async () => {
    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    mockMatchMedia();

    const mockSubmit = vi.fn<(values: BookFormValues) => void>();
    const { getByRole, findByRole } = render(
      <TestForm onSubmit={mockSubmit} />,
      { wrapper: createWrapper() },
    );

    const titleInput = await findByRole("textbox", { name: "書名" });
    const user = userEvent.setup();
    await user.type(titleInput, "valid title");

    await user.click(getByRole("button", { name: "送信" }));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: "valid title",
    });
  });

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
  });

  test("submits with read checkbox checked", async () => {
    mockMatchMedia();

    const mockSubmit = vi.fn<(values: BookFormValues) => void>();
    const { getByRole, findByRole } = render(
      <TestForm onSubmit={mockSubmit} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const titleInput = await findByRole("textbox", { name: "書名" });
    await user.type(titleInput, "valid title");

    const readCheckbox = await findByRole("checkbox", { name: "既読" });
    await user.click(readCheckbox);

    await user.click(getByRole("button", { name: "送信" }));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: "valid title",
      read: true,
    });
  });

  test("submits with empty ISBN (ISBN is optional)", async () => {
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
    expect(mockSubmit.mock.calls[0][0].isbn).toBe("");
  });
});
