import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, rs } from "@rstest/core";
import type { BookRevisionsQuery } from "../../generated/graphql-request";
import { querySuccess } from "../../test/reactQueryResults";
import { formatLocalTimestamp } from "../../test-utils/formatLocalTimestamp";
import { BookHistory } from "./BookHistory";
import { useBookRevisions } from "./api/useBookRevisions";

rs.mock(import("./api/useBookRevisions"));
const mockUseBookRevisions = rs.mocked(useBookRevisions);
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
      purchaseDate: "2020-12-31",
      bookCreatedAt: createdAt,
      bookUpdatedAt: createdAt,
      createdAt,
    },
  ],
};
const wrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => (
  <MantineProvider env="test">{children}</MantineProvider>
);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: rs.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: rs.fn(),
      removeEventListener: rs.fn(),
    })),
  });
});

test("renders revision history and detail", async () => {
  mockUseBookRevisions.mockReturnValue(querySuccess(revisions));
  render(
    <BookHistory
      bookId="book-1"
      authors={[{ id: "author-1", name: "著者1", yomi: "" }]}
    />,
    { wrapper },
  );
  expect(screen.getByText("テスト書籍1")).toBeInTheDocument();
  expect(screen.getByText(formatLocalTimestamp(createdAt))).toBeInTheDocument();
  const headers = screen.getAllByRole("columnheader");
  expect(headers.map((header) => header.textContent)).toEqual([
    "Revision",
    "Date",
    "Title",
    "Authors",
    "ISBN",
    "Format",
    "Store",
    "Read",
    "Owned",
    "Purchase date",
    "Detail",
  ]);
  const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
  expect(cells[8].querySelector("svg")).toBeInTheDocument();
  expect(cells[9]).toHaveTextContent("2020-12-31");
  await userEvent.click(
    screen.getByRole("button", { name: "View revision detail" }),
  );
  expect(screen.getByText("Revision Detail")).toBeInTheDocument();
  expect(screen.getByText("Revision:")).toBeInTheDocument();
});

test("renders no history when revisions are empty", () => {
  mockUseBookRevisions.mockReturnValue(querySuccess({ bookRevisions: [] }));
  render(<BookHistory bookId="book-1" authors={[]} />, { wrapper });
  expect(
    screen.queryByRole("heading", { name: "History" }),
  ).not.toBeInTheDocument();
});
