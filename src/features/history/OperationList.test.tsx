import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, vi } from "vitest";
import { OperationList } from "./OperationList";

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

vi.mock("../../components/mantineTsr", () => ({
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider env="test">{children}</MantineProvider>
);

test("renders operations with labels and timestamps", () => {
  render(
    <OperationList
      operations={[
        {
          id: "operation-1",
          type: "create_book",
          detail: null,
          createdAt: "2021-01-01T00:00:00Z",
        },
        {
          id: "operation-2",
          type: "future_operation",
          detail: null,
          createdAt: "2021-01-02T00:00:00Z",
        },
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
  render(<OperationList operations={[]} />, { wrapper });
  expect(screen.getByText("変更履歴はありません")).toBeInTheDocument();
});
