import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, beforeEach, test, vi } from "vitest";
import { useEventSet } from "../../compoments/hooks/useEventSet";
import { useEventSets } from "../../compoments/hooks/useEventSets";
import { HistoryDetailPage } from "./$eventSetId";
import { HistoryIndexPage } from "./index";

vi.mock(import("../../compoments/hooks/useEventSet"));
vi.mock(import("../../compoments/hooks/useEventSets"));
vi.mock("../../compoments/mantineTsr", () => ({
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
  vi.mocked(useEventSets, { partial: true }).mockReturnValue({
    isLoading: true,
  });
  const { rerender } = renderPage(<HistoryIndexPage />);
  expect(screen.getByLabelText("変更履歴を読み込み中")).toBeInTheDocument();
  vi.mocked(useEventSets, { partial: true }).mockReturnValue({
    isLoading: false,
    error: new Error("failure"),
  });
  rerender(<HistoryIndexPage />);
  expect(
    screen.getByText("変更履歴を読み込めませんでした"),
  ).toBeInTheDocument();
});

test("shows detail not-found and success states", () => {
  vi.mocked(useEventSet, { partial: true }).mockReturnValue({
    isLoading: false,
    data: { eventSet: null },
  });
  const { rerender } = renderPage(<HistoryDetailPage eventSetId="missing" />);
  expect(screen.getByText("変更履歴が見つかりません")).toBeInTheDocument();
  vi.mocked(useEventSet, { partial: true }).mockReturnValue({
    isLoading: false,
    data: {
      eventSet: {
        id: "set-1",
        operation: "create_book",
        createdAt: 1609459200,
        bookEvents: [],
        authorEvents: [],
      },
    },
  });
  rerender(<HistoryDetailPage eventSetId="set-1" />);
  expect(
    screen.getByRole("heading", { name: "書籍を追加" }),
  ).toBeInTheDocument();
});
