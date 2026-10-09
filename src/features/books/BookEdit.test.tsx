import { MantineProvider } from "@mantine/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { Book } from "./entity/Book";
import { BookEdit } from "./BookEdit";

const { recoverAuthors, updateBook, reportError, navigate, notify } =
  vi.hoisted(() => ({
    recoverAuthors: vi.fn(),
    updateBook: vi.fn(),
    reportError: vi.fn(),
    navigate: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
  }));

vi.mock("./useAuthorConflictRecovery", () => ({
  useAuthorConflictRecovery: () => recoverAuthors,
}));
vi.mock("./api/useUpdateBook", () => ({
  useUpdateBook: () => ({ mutateAsync: updateBook }),
}));
vi.mock("../../components/errors/AppErrorProvider", () => ({
  useAppError: () => ({ reportError }),
}));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));
vi.mock("@mantine/notifications", () => ({ showNotification: notify }));
vi.mock("../../components/mantineTsr", () => ({
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));
vi.mock("./BookUpdateForm", () => ({
  BookUpdateForm: ({
    form,
  }: {
    form: import("@mantine/form").UseFormReturnType<
      import("./bookFormSchema").BookFormValues
    >;
  }) => (
    <>
      <input aria-label="書名" {...form.getInputProps("title")} />
      <span data-testid="author-id">{form.values.authors[0]?.id}</span>
    </>
  ),
}));

const book: Book = {
  id: "book-1",
  title: "Original",
  authors: [{ id: "__pending__:new", name: "New author", yomi: "" }],
  isbn: "",
  read: false,
  owned: false,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
  purchaseDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  navigate.mockResolvedValue(undefined);
  recoverAuthors.mockResolvedValue(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup(): {
  save: HTMLElement;
  user: ReturnType<typeof userEvent.setup>;
} {
  render(
    <MantineProvider env="test">
      <BookEdit book={book} />
    </MantineProvider>,
  );
  const save = screen.getByRole("button", { name: "Save" });
  return { save, user: userEvent.setup() };
}

test("sends new author names with update and blocks repeated submits", async () => {
  const update = Promise.withResolvers<unknown>();
  updateBook.mockReturnValue(update.promise);
  const { save, user } = setup();
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(1);
  });
  expect(save).toBeDisabled();
  await user.click(save);
  expect(updateBook).toHaveBeenCalledTimes(1);
  expect(updateBook).toHaveBeenCalledWith(
    expect.objectContaining({ authorIds: [], newAuthorNames: ["New author"] }),
  );
  await act(async () => {
    update.resolve({});
    await update.promise;
  });
  await waitFor(() => expect(save).toBeEnabled());
});

test("failure keeps pending author and edited values for retry", async () => {
  updateBook.mockRejectedValueOnce(new Error("failed")).mockResolvedValue({});
  const { save, user } = setup();
  await user.clear(screen.getByRole("textbox", { name: "書名" }));
  await user.type(screen.getByRole("textbox", { name: "書名" }), "Edited");
  await user.click(save);
  await waitFor(() => {
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "UpdateBook" }),
    );
  });
  expect(screen.getByTestId("author-id")).toHaveTextContent("__pending__:new");
  expect(screen.getByRole("textbox", { name: "書名" })).toHaveValue("Edited");
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(2);
  });
});

test("keeps submission locked during recovery and requires confirmation before retry", async () => {
  updateBook.mockRejectedValueOnce(new Error("conflict")).mockResolvedValue({});
  const recovery = Promise.withResolvers<boolean>();
  recoverAuthors.mockImplementation(
    async (
      _error: unknown,
      _submitted: unknown,
      _getCurrent: unknown,
      setAuthors: (authors: { id: string; name: string }[]) => void,
    ) => {
      const result = await recovery.promise;
      setAuthors([{ id: "existing", name: "New author" }]);
      return result;
    },
  );
  const { save, user } = setup();
  await user.click(save);
  await waitFor(() => {
    expect(recoverAuthors).toHaveBeenCalledTimes(1);
  });
  expect(save).toBeDisabled();
  await act(async () => {
    recovery.resolve(true);
    await recovery.promise;
  });
  await waitFor(() => expect(save).toBeEnabled());
  expect(updateBook).toHaveBeenCalledTimes(1);
  expect(reportError).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(2);
  });
  expect(updateBook).toHaveBeenLastCalledWith(
    expect.objectContaining({ authorIds: ["existing"], newAuthorNames: [] }),
  );
});
