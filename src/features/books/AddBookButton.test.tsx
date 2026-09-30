import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type {
  CreateAuthorMutation,
  CreateBookMutation,
  Sdk,
} from "../../generated/graphql-request";
import { AddBookButton } from "./AddBookButton";

const { sdk, reportError, notify } = vi.hoisted(() => ({
  sdk: {
    createAuthor: vi.fn<Sdk["createAuthor"]>(),
    createBook: vi.fn<Sdk["createBook"]>(),
    authors: vi.fn<Sdk["authors"]>(),
  },
  reportError: vi.fn(),
  notify: vi.fn(),
}));
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn() }),
}));
vi.mock("../../lib/graphqlClient", () => ({
  createAuthenticatedSdk: () => Promise.resolve(sdk),
}));
vi.mock("../../components/errors/AppErrorProvider", () => ({
  useAppError: () => ({ reportError }),
}));
vi.mock("@mantine/notifications", () => ({ showNotification: notify }));
vi.mock("./useBookLookup", () => ({
  useBookLookup: () => ({
    state: {
      status: "success",
      results: [
        {
          title: "Retained book",
          isbn: "",
          publisher: "",
          authorNames: ["New author"],
        },
      ],
    },
    search: vi.fn(),
  }),
}));

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  sdk.authors.mockResolvedValue({ authors: [] });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (scrollIntoViewDescriptor != null)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollIntoViewDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

async function setup(): Promise<{
  user: ReturnType<typeof userEvent.setup>;
  dialog: HTMLElement;
  title: HTMLElement;
  submit: HTMLElement;
  cleanup: () => void;
}> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <AddBookButton />
      </MantineProvider>
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "追加" }));
  const dialog = await screen.findByRole("dialog", { name: "書籍追加" });
  const title = await within(dialog).findByRole("textbox", { name: "書名" });
  await user.click(
    within(dialog).getByRole("button", { name: "検索して自動入力" }),
  );
  const lookup = await screen.findByRole("dialog", { name: "書籍を検索" });
  await user.click(within(lookup).getByRole("button", { name: "選択" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "書籍を検索" }),
    ).not.toBeInTheDocument(),
  );
  await user.type(within(dialog).getByLabelText("購入日"), "2026-09-28");
  const submit = within(dialog).getByRole("button", { name: "追加" });
  return {
    user,
    dialog,
    title,
    submit,
    cleanup: () => {
      view.unmount();
      client.clear();
    },
  };
}
const createdAuthor: CreateAuthorMutation = {
  createAuthor: { author: { id: "resolved-author" } },
};
const createdBook: CreateBookMutation = {
  createBook: { book: { id: "created-book" } },
};

test("author failure retains input, prevents book creation, and allows retry", async () => {
  const pending = Promise.withResolvers<CreateAuthorMutation>();
  sdk.createAuthor
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(createdAuthor);
  sdk.createBook.mockResolvedValue(createdBook);
  const { user, dialog, title, submit, cleanup } = await setup();
  try {
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    });
    const failure = new Error("Cannot create author");
    await act(async () => {
      pending.reject(failure);
      await pending.promise.catch(() => undefined);
    });
    await waitFor(() => {
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "CreateAuthor", error: failure }),
      );
    });
    expect(sdk.createBook).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
    expect(title).toHaveValue("Retained book");
    expect(within(dialog).getByLabelText("購入日")).toHaveValue("2026-09-28");
    expect(
      within(dialog).getByRole("button", { name: "Edit author New author" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(sdk.createAuthor).toHaveBeenCalledTimes(2);
    expect(sdk.createBook).toHaveBeenCalledTimes(1);
    expect(sdk.createBook.mock.calls[0][0].bookData).toMatchObject({
      title: "Retained book",
      purchaseDate: "2026-09-28",
      authorIds: ["resolved-author"],
    });
    expect(notify).toHaveBeenCalledTimes(1);
  } finally {
    cleanup();
  }
});

test("book failure retains resolved authors and retry does not create them again", async () => {
  const pending = Promise.withResolvers<CreateBookMutation>();
  sdk.createAuthor.mockResolvedValue(createdAuthor);
  sdk.createBook
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(createdBook);
  const { user, dialog, title, submit, cleanup } = await setup();
  try {
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(1);
    });
    const failure = new Error("Cannot create book");
    await act(async () => {
      pending.reject(failure);
      await pending.promise.catch(() => undefined);
    });
    await waitFor(() => {
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "CreateBook", error: failure }),
      );
    });
    expect(notify).not.toHaveBeenCalled();
    expect(title).toHaveValue("Retained book");
    expect(within(dialog).getByLabelText("購入日")).toHaveValue("2026-09-28");
    expect(
      within(dialog).queryByRole("button", { name: "Edit author New author" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText("New author", { exact: true }),
    ).toBeInTheDocument();
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    expect(sdk.createBook).toHaveBeenCalledTimes(2);
    for (const [variables] of sdk.createBook.mock.calls) {
      expect(variables.bookData).toMatchObject({
        title: "Retained book",
        purchaseDate: "2026-09-28",
        authorIds: ["resolved-author"],
      });
    }
    expect(notify).toHaveBeenCalledTimes(1);
  } finally {
    cleanup();
  }
});

test("blocks duplicate submission throughout author and book creation", async () => {
  const author = Promise.withResolvers<CreateAuthorMutation>();
  const book = Promise.withResolvers<CreateBookMutation>();
  sdk.createAuthor.mockReturnValue(author.promise);
  sdk.createBook.mockReturnValue(book.promise);
  const { user, submit, cleanup } = await setup();
  try {
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    await act(async () => {
      author.resolve(createdAuthor);
      await author.promise;
    });
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(1);
    });
    expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(sdk.createBook).toHaveBeenCalledTimes(1);
    await act(async () => {
      book.resolve(createdBook);
      await book.promise;
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(sdk.createAuthor).toHaveBeenCalledTimes(1);
    expect(sdk.createBook).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(1);
  } finally {
    cleanup();
  }
});
