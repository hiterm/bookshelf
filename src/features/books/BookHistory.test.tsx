import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, vi } from "vitest";
import type { BookRevisionsQuery } from "../../generated/graphql-request";
import { BookHistory } from "./BookHistory";
import { useBookRevisions } from "./api/useBookRevisions";

vi.mock(import("./api/useBookRevisions"));
const mockUseBookRevisions = vi.mocked(useBookRevisions, { partial: true });
const createdAt = "2021-01-01T00:00:00Z";
const revisions: BookRevisionsQuery = {
  bookRevisions: [
    {
      bookId: "book-1",
      revisionNumber: 1,
      title: "テスト書籍1",
      authorIds: ["author-1"],
      isbn: "978-4-00-000001-0",
      read: false,
      owned: true,
      priority: 50,
      format: "PRINTED",
      store: "UNKNOWN",
      bookCreatedAt: createdAt,
      bookUpdatedAt: createdAt,
      createdAt,
    },
  ],
};
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider env="test">{children}</MantineProvider>
);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

test("renders revision history and detail", async () => {
  mockUseBookRevisions.mockReturnValue({
    data: revisions,
    isLoading: false,
    error: null,
  });
  render(
    <BookHistory
      bookId="book-1"
      authors={[{ id: "author-1", name: "著者1", yomi: "" }]}
    />,
    { wrapper },
  );
  expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  expect(screen.getByText("2021/01/01 00:00:00")).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "View revision detail" }),
  );
  expect(screen.getByText("Revision Detail")).toBeInTheDocument();
  expect(screen.getByText("Revision:")).toBeInTheDocument();
});

test("renders no history when revisions are empty", () => {
  mockUseBookRevisions.mockReturnValue({
    data: { bookRevisions: [] },
    isLoading: false,
    error: null,
  });
  render(<BookHistory bookId="book-1" authors={[]} />, { wrapper });
  expect(
    screen.queryByRole("heading", { name: "History" }),
  ).not.toBeInTheDocument();
});
