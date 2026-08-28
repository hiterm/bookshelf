import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, vi } from "vitest";
import type { AuthorRevisionsQuery } from "../../generated/graphql-request";
import { AuthorHistory } from "./AuthorHistory";
import { useAuthorRevisions } from "./api/useAuthorRevisions";

vi.mock(import("./api/useAuthorRevisions"));
const mockUseAuthorRevisions = vi.mocked(useAuthorRevisions, { partial: true });
const createdAt = "2021-01-01T00:00:00Z";
const revisions: AuthorRevisionsQuery = {
  authorRevisions: [
    {
      authorId: "author-1",
      revisionNumber: 1,
      name: "著者1",
      yomi: "ちょしゃいち",
      authorCreatedAt: createdAt,
      authorUpdatedAt: createdAt,
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

test("renders author revision history and detail", async () => {
  mockUseAuthorRevisions.mockReturnValue({
    data: revisions,
    isLoading: false,
    error: null,
  });
  render(<AuthorHistory authorId="author-1" />, { wrapper });
  expect(screen.getByText("著者1")).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "View revision detail" }),
  );
  expect(screen.getByText("Revision Detail")).toBeInTheDocument();
  expect(screen.getByText("Revision:")).toBeInTheDocument();
});

test("renders no history when revisions are empty", () => {
  mockUseAuthorRevisions.mockReturnValue({
    data: { authorRevisions: [] },
    isLoading: false,
    error: null,
  });
  render(<AuthorHistory authorId="author-1" />, { wrapper });
  expect(
    screen.queryByRole("heading", { name: "History" }),
  ).not.toBeInTheDocument();
});
