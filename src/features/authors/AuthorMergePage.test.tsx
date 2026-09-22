import { MantineProvider } from "@mantine/core";
import * as routerActual from "@tanstack/react-router" with {
  rstest: "importActual",
};
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  rs,
} from "@rstest/core";
import type { MergeAuthorMutation } from "../../generated/graphql-request";
import { mutationIdle, querySuccess } from "../../test/reactQueryResults";
import { useAuthor } from "./api/useAuthor";
import { useAuthors } from "./api/useAuthors";
import { useMergeAuthor } from "./api/useMergeAuthor";
import type { MergeAuthorInput } from "./api/useMergeAuthor";
import { AuthorMergePage } from "./AuthorMergePage";
import { AppErrorProvider } from "../../components/errors/AppErrorProvider";

const navigate = rs
  .fn<ReturnType<typeof routerActual.useNavigate>>()
  .mockResolvedValue(undefined);
const mutateAsync = rs
  .fn<ReturnType<typeof useMergeAuthor>["mutateAsync"]>()
  .mockResolvedValue({
    mergeAuthor: { author: { id: "author-2" }, operationId: "operation-1" },
  });

rs.mock("@tanstack/react-router", () => ({
  ...routerActual,
  useNavigate: () => navigate,
}));
rs.mock(import("./api/useAuthor"));
rs.mock(import("./api/useAuthors"));
rs.mock(import("./api/useMergeAuthor"));
rs.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));
rs.mock("@mantine/notifications", () => ({ showNotification: rs.fn() }));

const authors = [
  { id: "author-1", name: "統合元", yomi: "とうごうもと" },
  { id: "author-2", name: "統合先", yomi: "とうごうさき" },
];

function findAuthor(
  id: string,
): { id: string; name: string; yomi: string } | null {
  return authors.find((author) => author.id === id) ?? null;
}

type TestBook = {
  id: string;
  title: string;
  isbn: string;
  format: "PRINTED" | "E_BOOK";
  read: boolean;
  owned: boolean;
};

const sourceBooks: TestBook[] = [
  {
    id: "book-1",
    title: "移動する本",
    isbn: "978-1",
    format: "PRINTED" as const,
    read: false,
    owned: true,
  },
];

const destinationBooks: TestBook[] = [
  {
    id: "book-2",
    title: "既存の本",
    isbn: "978-2",
    format: "E_BOOK" as const,
    read: true,
    owned: true,
  },
];

const books: Record<string, TestBook[]> = {
  "author-1": sourceBooks,
  "author-2": destinationBooks,
};

beforeAll(() => {
  rs.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe = rs.fn();
      unobserve = rs.fn();
      disconnect = rs.fn();
    },
  );
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

beforeEach(() => {
  navigate.mockClear();
  mutateAsync.mockClear();
  rs.mocked(useAuthors).mockReturnValue(querySuccess({ authors }));
  rs.mocked(useAuthor).mockImplementation((id) => {
    const author = findAuthor(id);
    return querySuccess({
      author: author == null ? null : { ...author, books: books[id] ?? [] },
    });
  });
  rs.mocked(useMergeAuthor).mockReturnValue(
    mutationIdle<MergeAuthorMutation, MergeAuthorInput>({ mutateAsync }),
  );
});

const renderPage = (): ReturnType<typeof render> =>
  render(<AuthorMergePage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <AppErrorProvider>{children}</AppErrorProvider>
      </MantineProvider>
    ),
  });

const selectAuthor = async (label: string, option: string): Promise<void> => {
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  await userEvent.click(screen.getByRole("option", { name: option }));
};

describe("AuthorMergePage", () => {
  test("shows both selected authors' books", async () => {
    renderPage();
    await selectAuthor("統合元の著者", "統合元（とうごうもと）");
    await selectAuthor("統合先の著者", "統合先（とうごうさき）");

    expect(screen.getByText("移動する本")).toBeInTheDocument();
    expect(screen.getByText("既存の本")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "統合元「統合元」の著書（1冊）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "統合先「統合先」の著書（1冊）" }),
    ).toBeInTheDocument();
  });

  test("rejects selecting the same author", async () => {
    renderPage();
    await selectAuthor("統合元の著者", "統合元（とうごうもと）");
    await selectAuthor("統合先の著者", "統合元（とうごうもと）");

    expect(
      screen.getByText("同じ著者同士は統合できません"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "統合内容を確認" }),
    ).toBeDisabled();
  });

  test("confirms, merges, and navigates to the destination", async () => {
    renderPage();
    await selectAuthor("統合元の著者", "統合元（とうごうもと）");
    await selectAuthor("統合先の著者", "統合先（とうごうさき）");
    await userEvent.click(
      screen.getByRole("button", { name: "統合内容を確認" }),
    );

    const dialog = screen.getByRole("dialog", { name: "著者統合の確認" });
    expect(
      within(dialog).getByText(
        "「統合元」を削除し、すべての著書を「統合先」へ移動します。",
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "統合する" }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        sourceAuthorId: "author-1",
        destinationAuthorId: "author-2",
      });
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/authors/$id",
      params: { id: "author-2" },
    });
  });
});
