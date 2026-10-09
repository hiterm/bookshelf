import { GraphQLError } from "graphql";
import { ClientError } from "graphql-request";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { CreateBookMutation, Sdk } from "../../generated/graphql-request";
import { AddBookButton } from "./AddBookButton";

const { sdk, reportError, notify } = vi.hoisted(() => ({
  sdk: {
    createAuthor: vi.fn<Sdk["createAuthor"]>(),
    createBook: vi.fn<Sdk["createBook"]>(),
    authors: vi.fn<Sdk["authors"]>(),
  },
  reportError: vi.fn(),
  notify: vi.fn<(input: { message: unknown }) => void>(),
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
const createdBook: CreateBookMutation = {
  createBook: { book: { id: "created-book" } },
};
const conflict = (): ClientError =>
  new ClientError(
    {
      status: 200,
      headers: new Headers(),
      body: "",
      errors: [
        new GraphQLError("duplicate", {
          extensions: { code: "CONFLICT", reason: "AUTHOR_NAME_CONFLICT" },
        }),
      ],
    },
    { query: "mutation" },
  );

test("sends one atomic book request and retains all input after failure", async () => {
  sdk.createBook
    .mockRejectedValueOnce(new Error("save failed"))
    .mockResolvedValue(createdBook);
  const { user, dialog, title, submit, cleanup } = await setup();
  try {
    await user.click(submit);
    await waitFor(() => {
      expect(reportError).toHaveBeenCalled();
    });
    expect(title).toHaveValue("Retained book");
    expect(within(dialog).getByLabelText("購入日")).toHaveValue("2026-09-28");
    expect(sdk.createAuthor).not.toHaveBeenCalled();
    expect(sdk.createBook.mock.calls.at(-1)?.[0].bookData).toMatchObject({
      authorIds: [],
      newAuthorNames: ["New author"],
    });
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(2);
    });
    expect(sdk.createAuthor).not.toHaveBeenCalled();
  } finally {
    cleanup();
  }
});

test("conflict refreshes and replaces pending authors without automatically saving", async () => {
  sdk.createBook
    .mockRejectedValueOnce(conflict())
    .mockResolvedValue(createdBook);
  const { user, dialog, submit, cleanup } = await setup();
  try {
    const refresh =
      Promise.withResolvers<Awaited<ReturnType<Sdk["authors"]>>>();
    sdk.authors.mockReturnValue(refresh.promise);
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(1);
    });
    expect(submit).toBeDisabled();
    await act(async () => {
      refresh.resolve({
        authors: [{ id: "existing", name: "New author", yomi: "" }],
      });
      await refresh.promise;
    });
    await waitFor(() => expect(submit).toBeEnabled());
    expect(notify.mock.calls.at(-1)?.[0].message).toContain(
      "書籍はまだ保存されていません",
    );
    expect(reportError).not.toHaveBeenCalled();
    expect(sdk.createBook).toHaveBeenCalledTimes(1);
    expect(
      within(dialog).queryByRole("button", { name: "Edit author New author" }),
    ).not.toBeInTheDocument();
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(2);
    });
    expect(sdk.createBook.mock.calls.at(-1)?.[0].bookData).toMatchObject({
      authorIds: ["existing"],
      newAuthorNames: [],
    });
  } finally {
    cleanup();
  }
});

test("refresh failure preserves pending selections and reports the save error", async () => {
  sdk.createBook.mockRejectedValue(conflict());
  const { user, submit, cleanup } = await setup();
  try {
    sdk.authors.mockRejectedValue(new Error("offline"));
    await user.click(submit);
    await waitFor(() => {
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "CreateBook" }),
      );
    });
    expect(notify).not.toHaveBeenCalled();
    expect(submit).toBeEnabled();
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(2);
    });
    expect(sdk.createBook.mock.calls.at(-1)?.[0].bookData).toMatchObject({
      newAuthorNames: ["New author"],
    });
  } finally {
    cleanup();
  }
});

test("blocks repeated submits until the book request finishes", async () => {
  const pending = Promise.withResolvers<CreateBookMutation>();
  sdk.createBook.mockReturnValue(pending.promise);
  const { user, submit, cleanup } = await setup();
  try {
    await user.click(submit);
    await waitFor(() => {
      expect(sdk.createBook).toHaveBeenCalledTimes(1);
    });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(sdk.createBook).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve(createdBook);
      await pending.promise;
    });
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(1);
    });
  } finally {
    cleanup();
  }
});
