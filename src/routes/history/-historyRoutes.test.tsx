import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, beforeEach, test, rs } from "@rstest/core";
import type { OperationsQuery } from "../../generated/graphql-request";
import {
  queryError,
  queryLoading,
  querySuccess,
} from "../../test/reactQueryResults";
import { useOperation } from "../../features/history/api/useOperation";
import { useOperations } from "../../features/history/api/useOperations";
import { HistoryDetailPage } from "./-HistoryDetailPage";
import { HistoryIndexPage } from "./-HistoryIndexPage";

rs.mock(import("../../features/history/api/useOperation"));
rs.mock(import("../../features/history/api/useOperations"));
rs.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <a href="/history">{children}</a>
  ),
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: rs.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: rs.fn(),
      removeListener: rs.fn(),
      addEventListener: rs.fn(),
      removeEventListener: rs.fn(),
      dispatchEvent: rs.fn(),
    })),
  });
});

beforeEach(() => {
  rs.resetAllMocks();
});

const renderPage = (node: React.ReactNode): ReturnType<typeof render> =>
  render(node, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

test("shows list loading and error states", () => {
  rs.mocked(useOperations).mockReturnValue(queryLoading<OperationsQuery>());
  const { rerender } = renderPage(<HistoryIndexPage />);
  expect(screen.getByLabelText("変更履歴を読み込み中")).toBeInTheDocument();
  rs.mocked(useOperations).mockReturnValue(
    queryError<OperationsQuery>(new Error("failure")),
  );
  rerender(<HistoryIndexPage />);
  expect(
    screen.getByText("変更履歴を読み込めませんでした"),
  ).toBeInTheDocument();
});

test("shows detail not-found and success states", () => {
  rs.mocked(useOperation).mockReturnValue(querySuccess({ operation: null }));
  const { rerender } = renderPage(<HistoryDetailPage operationId="missing" />);
  expect(screen.getByText("変更履歴が見つかりません")).toBeInTheDocument();
  rs.mocked(useOperation).mockReturnValue(
    querySuccess({
      operation: {
        id: "operation-1",
        type: "create_book",
        detail: null,
        createdAt: "2021-01-01T00:00:00Z",
        bookChanges: [],
        authorChanges: [],
      },
    }),
  );
  rerender(<HistoryDetailPage operationId="operation-1" />);
  expect(
    screen.getByRole("heading", { name: "書籍を追加" }),
  ).toBeInTheDocument();
});
