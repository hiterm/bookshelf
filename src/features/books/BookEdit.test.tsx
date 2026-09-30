import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { Book } from "./entity/Book";
import { BookEdit } from "./BookEdit";

const { createAuthor, updateBook, reportError, navigate, notify } = vi.hoisted(
  () => ({
    createAuthor: vi.fn(),
    updateBook: vi.fn(),
    reportError: vi.fn(),
    navigate: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
  }),
);

vi.mock("../authors/api/useCreateAuthor", () => ({
  useCreateAuthor: () => ({ mutateAsync: createAuthor }),
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
  navigate.mockResolvedValue(undefined);
});

function setup(): {
  save: HTMLElement;
  form: HTMLFormElement;
  user: ReturnType<typeof userEvent.setup>;
} {
  render(
    <MantineProvider env="test">
      <BookEdit book={book} />
    </MantineProvider>,
  );
  const save = screen.getByRole("button", { name: "Save" });
  const form = save.closest("form");
  if (form == null) throw new Error("Expected book form");
  return { save, form, user: userEvent.setup() };
}

test("blocks repeat submits during author resolution and book update", async () => {
  const author = Promise.withResolvers<{
    createAuthor: { author: { id: string } };
  }>();
  const update = Promise.withResolvers<unknown>();
  createAuthor.mockReturnValue(author.promise);
  updateBook.mockReturnValue(update.promise);
  const { save, form, user } = setup();

  await user.click(save);
  await waitFor(() => {
    expect(createAuthor).toHaveBeenCalledTimes(1);
  });
  expect(save).toBeDisabled();
  fireEvent.submit(form);
  expect(createAuthor).toHaveBeenCalledTimes(1);

  await act(async () => {
    author.resolve({ createAuthor: { author: { id: "resolved" } } });
    await author.promise;
  });
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(1);
  });
  expect(save).toBeDisabled();
  fireEvent.submit(form);
  expect(updateBook).toHaveBeenCalledTimes(1);
  expect(updateBook).toHaveBeenCalledWith(
    expect.objectContaining({ authorIds: ["resolved"] }),
  );

  await act(async () => {
    update.resolve({});
    await update.promise;
  });
  await waitFor(() => expect(save).toBeEnabled());
  expect(notify).toHaveBeenCalledTimes(1);
});

test("author failure retains values and allows retry", async () => {
  const author = Promise.withResolvers<unknown>();
  createAuthor
    .mockReturnValueOnce(author.promise)
    .mockResolvedValue({ createAuthor: { author: { id: "resolved" } } });
  updateBook.mockResolvedValue({});
  const { save, user } = setup();
  await user.clear(screen.getByRole("textbox", { name: "書名" }));
  await user.type(screen.getByRole("textbox", { name: "書名" }), "Edited");
  await user.click(save);
  await waitFor(() => {
    expect(createAuthor).toHaveBeenCalledTimes(1);
  });
  await act(async () => {
    author.reject(new Error("creation failed"));
    await author.promise.catch(() => undefined);
  });
  await waitFor(() => expect(save).toBeEnabled());
  expect(screen.getByRole("textbox", { name: "書名" })).toHaveValue("Edited");
  expect(screen.getByTestId("author-id")).toHaveTextContent("__pending__:new");
  expect(updateBook).not.toHaveBeenCalled();
  expect(reportError).toHaveBeenCalledWith(
    expect.objectContaining({ operation: "CreateAuthor" }),
  );
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(1);
  });
  expect(createAuthor).toHaveBeenCalledTimes(2);
});

test("book update failure retains resolved author and retries without recreation", async () => {
  const update = Promise.withResolvers<unknown>();
  createAuthor.mockResolvedValue({
    createAuthor: { author: { id: "resolved" } },
  });
  updateBook.mockReturnValueOnce(update.promise).mockResolvedValue({});
  const { save, user } = setup();
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(1);
  });
  await act(async () => {
    update.reject(new Error("update failed"));
    await update.promise.catch(() => undefined);
  });
  await waitFor(() => expect(save).toBeEnabled());
  expect(screen.getByTestId("author-id")).toHaveTextContent("resolved");
  expect(reportError).toHaveBeenCalledWith(
    expect.objectContaining({ operation: "UpdateBook" }),
  );
  await user.click(save);
  await waitFor(() => {
    expect(updateBook).toHaveBeenCalledTimes(2);
  });
  expect(createAuthor).toHaveBeenCalledTimes(1);
});
