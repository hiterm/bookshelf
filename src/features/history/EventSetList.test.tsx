import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, vi } from "vitest";
import { EventSetList } from "./EventSetList";

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

vi.mock("../../compoments/mantineTsr", () => ({
  Link: ({
    children,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    "aria-label": string;
  }) => (
    <a href="/history/test" aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MantineProvider env="test">{children}</MantineProvider>
);

test("renders multiple labeled EventSets and timestamps", () => {
  render(
    <EventSetList
      eventSets={[
        { id: "set-1", operation: "create_book", createdAt: 1609459200 },
        { id: "set-2", operation: "future_operation", createdAt: 1609545600 },
      ]}
    />,
    { wrapper },
  );
  expect(
    screen.getByRole("link", { name: "書籍を追加の詳細" }),
  ).toBeInTheDocument();
  expect(screen.getByText("future_operation")).toBeInTheDocument();
  expect(screen.getByText("2021/01/01 00:00:00")).toBeInTheDocument();
});

test("renders an empty state", () => {
  render(<EventSetList eventSets={[]} />, { wrapper });
  expect(screen.getByText("変更履歴はありません")).toBeInTheDocument();
});
