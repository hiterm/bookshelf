import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, beforeEach, test, vi } from "vitest";
import { useOperation } from "../../features/history/api/useOperation";
import { useOperations } from "../../features/history/api/useOperations";
import { HistoryDetailPage } from "./-HistoryDetailPage";
import { HistoryIndexPage } from "./-HistoryIndexPage";

vi.mock(import("../../features/history/api/useOperation"));
vi.mock(import("../../features/history/api/useOperations"));
vi.mock("../../components/mantineTsr", () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <a href="/history">{children}</a>
  ),
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => vi.resetAllMocks());

const renderPage = (node: React.ReactNode) =>
  render(node, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

test("shows list loading and error states", () => {
  vi.mocked(useOperations, { partial: true }).mockReturnValue({
    isLoading: true,
  });
  const { rerender } = renderPage(<HistoryIndexPage />);
  expect(screen.getByLabelText("変更履歴を読み込み中")).toBeInTheDocument();
  vi.mocked(useOperations, { partial: true }).mockReturnValue({
    isLoading: false,
    error: new Error("failure"),
  });
  rerender(<HistoryIndexPage />);
  expect(
    screen.getByText("変更履歴を読み込めませんでした"),
  ).toBeInTheDocument();
});

test("shows detail not-found and success states", () => {
  vi.mocked(useOperation, { partial: true }).mockReturnValue({
    isLoading: false,
    data: { operation: null },
  });
  const { rerender } = renderPage(<HistoryDetailPage operationId="missing" />);
  expect(screen.getByText("変更履歴が見つかりません")).toBeInTheDocument();
  vi.mocked(useOperation, { partial: true }).mockReturnValue({
    isLoading: false,
    data: {
      operation: {
        id: "operation-1",
        type: "create_book",
        detail: null,
        createdAt: "2021-01-01T00:00:00Z",
        bookChanges: [],
        authorChanges: [],
      },
    },
  });
  rerender(<HistoryDetailPage operationId="operation-1" />);
  expect(
    screen.getByRole("heading", { name: "書籍を追加" }),
  ).toBeInTheDocument();
});
