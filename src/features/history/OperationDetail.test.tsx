import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, vi } from "vitest";
import type { OperationQuery } from "../../generated/graphql-request";
import { OperationDetail } from "./OperationDetail";

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

const createdAt = "2021-01-01T00:00:00Z";
const operation: NonNullable<OperationQuery["operation"]> = {
  id: "operation-1",
  type: "import_books",
  detail: { source: "test" },
  createdAt,
  bookChanges: [
    {
      bookId: "book-1",
      beforeRevision: null,
      afterRevision: {
        bookId: "book-1",
        revisionNumber: 1,
        title: "履歴の本",
        authorIds: ["author-1"],
        isbn: "",
        read: false,
        owned: true,
        priority: 50,
        format: "PRINTED",
        store: "UNKNOWN",
        bookCreatedAt: createdAt,
        bookUpdatedAt: createdAt,
        createdAt,
      },
    },
  ],
  authorChanges: [
    {
      authorId: "author-1",
      beforeRevision: null,
      afterRevision: {
        authorId: "author-1",
        revisionNumber: 1,
        name: "著者",
        yomi: "ちょしゃ",
        authorCreatedAt: createdAt,
        authorUpdatedAt: createdAt,
        createdAt,
      },
    },
  ],
};

test("displays operation changes and detail on demand", async () => {
  render(<OperationDetail operation={operation} />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });
  expect(
    screen.getByRole("heading", { name: "書籍をインポート" }),
  ).toBeInTheDocument();
  expect(screen.getByText("書籍 (1)")).toBeInTheDocument();
  expect(screen.getByText("著者 (1)")).toBeInTheDocument();
  expect(screen.getByText(/"source": "test"/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "履歴の本" }));
  expect(screen.getAllByText("変更後").length).toBeGreaterThan(0);
});
