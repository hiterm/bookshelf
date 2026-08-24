import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { useAuthor } from "../../compoments/hooks/useAuthor";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { useMergeAuthor } from "../../compoments/hooks/useMergeAuthor";
import { AuthorMergePage } from "./AuthorMergePage";
import { AppErrorProvider } from "../../compoments/errors/AppErrorProvider";

const navigate = vi.fn().mockResolvedValue(undefined);
const mutateAsync = vi.fn().mockResolvedValue({
  mergeAuthor: { author: { id: "author-2" }, eventSetId: "event-set-1" },
});

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock(import("../../compoments/hooks/useAuthor"));
vi.mock(import("../../compoments/hooks/useAuthors"));
vi.mock(import("../../compoments/hooks/useMergeAuthor"));
vi.mock("../../compoments/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

const authors = [
  { id: "author-1", name: "統合元", yomi: "とうごうもと" },
  { id: "author-2", name: "統合先", yomi: "とうごうさき" },
];

function findAuthor(id: string) {
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
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
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

beforeEach(() => {
  navigate.mockClear();
  mutateAsync.mockClear();
  vi.mocked(useAuthors, { partial: true }).mockReturnValue({
    data: { authors },
    isLoading: false,
    error: null,
  });
  vi.mocked(useAuthor, { partial: true }).mockImplementation((id) => {
    const author = findAuthor(id);
    return {
      data:
        author == null
          ? undefined
          : { author: { ...author, books: books[id] ?? [] } },
      isLoading: false,
      error: null,
    };
  });
  vi.mocked(useMergeAuthor, { partial: true }).mockReturnValue({
    mutateAsync,
    isPending: false,
  });
});

const renderPage = () =>
  render(<AuthorMergePage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">
        <AppErrorProvider>{children}</AppErrorProvider>
      </MantineProvider>
    ),
  });

const selectAuthor = async (label: string, option: string) => {
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
