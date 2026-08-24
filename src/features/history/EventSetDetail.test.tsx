import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, vi } from "vitest";
import type { EventSetQuery } from "../../generated/graphql-request";
import { EventSetDetail } from "./EventSetDetail";

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

const eventSet: NonNullable<EventSetQuery["eventSet"]> = {
  id: "set-1",
  operation: "import_books",
  createdAt: 1609459200,
  bookEvents: [
    {
      eventId: "book-event",
      eventSetId: "set-1",
      operation: "CREATE",
      bookId: "book-1",
      title: "履歴の本",
      authorIds: ["author-1"],
      isbn: null,
      read: false,
      owned: true,
      priority: null,
      format: null,
      store: null,
      bookCreatedAt: null,
      bookUpdatedAt: null,
      changedAt: 1609459200,
      extra: { source: "test" },
    },
  ],
  authorEvents: [
    {
      eventId: "author-event",
      eventSetId: "set-1",
      operation: "CREATE",
      authorId: "author-1",
      name: null,
      yomi: null,
      authorCreatedAt: null,
      authorUpdatedAt: null,
      changedAt: 1609459200,
      extra: null,
    },
  ],
};

test("keeps snapshots collapsed and displays nullable fields and extra on demand", async () => {
  render(<EventSetDetail eventSet={eventSet} />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });
  expect(
    screen.getByRole("heading", { name: "書籍をインポート" }),
  ).toBeInTheDocument();
  expect(screen.getByText("書籍 (1)")).toBeInTheDocument();
  expect(screen.getByText("著者 (1)")).toBeInTheDocument();
  expect(screen.getByText("ISBN")).not.toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "追加: 履歴の本" }));
  expect(screen.getByText("ISBN")).toBeInTheDocument();
  expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  expect(screen.getByText("追加情報")).toBeInTheDocument();
  expect(screen.getByText(/"source": "test"/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "追加: author-1" }),
  ).toBeInTheDocument();
});
