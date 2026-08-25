import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { useCreateAuthor } from "../../features/authors/api/useCreateAuthor";
import { useAuthors } from "../../features/authors/api/useAuthors";
import { AuthorIndexPage } from "./index";

vi.mock(import("../../features/authors/api/useCreateAuthor"));
vi.mock(import("../../features/authors/api/useAuthors"));

vi.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LinkButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const authors = Array.from({ length: 11 }, (_, index) => ({
  id: `author-${String(index + 1)}`,
  name: `著者${String(index + 1)}`,
  yomi: `ちょしゃ${String(index + 1)}`,
}));

vi.mocked(useAuthors, { partial: true }).mockReturnValue({
  data: { authors },
  isLoading: false,
  error: null,
});

vi.mocked(useCreateAuthor, { partial: true }).mockReturnValue({
  mutate: vi.fn(),
  isPending: false,
});

beforeAll(() => {
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

const renderPage = () =>
  render(<AuthorIndexPage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

describe("AuthorIndexPage table features", () => {
  test("displays authors", () => {
    renderPage();

    expect(screen.getByText("著者1")).toBeInTheDocument();
    expect(screen.getByText("ちょしゃ1")).toBeInTheDocument();
  });

  test("filters authors by the global search", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("検索..."), {
      target: { value: "著者11" },
    });

    await waitFor(() => {
      expect(screen.getByText("著者11")).toBeInTheDocument();
    });
    expect(screen.queryByText("著者1")).not.toBeInTheDocument();
  });

  test("paginates authors", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(screen.getByText("著者11")).toBeInTheDocument();
    });
    expect(screen.queryByText("著者1")).not.toBeInTheDocument();
  });
});
