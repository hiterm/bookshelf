import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { BookImportPreview } from "./BookImportPreview";

const preview = {
  books: [
    {
      title: "1冊目",
      authors: [{ name: "既存著者", status: "EXISTING" as const }],
      isbn: "",
      read: true,
      owned: true,
      priority: 50,
      format: "E_BOOK" as const,
      store: "KINDLE" as const,
      purchaseDate: "2024-05-01",
    },
    {
      title: "2冊目",
      authors: [{ name: "新規著者", status: "NEW" as const }],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "E_BOOK" as const,
      store: "KINDLE" as const,
      purchaseDate: null,
    },
  ],
};

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
    })),
  });
});

describe("BookImportPreview", () => {
  test("shows count-aware fixed actions", () => {
    render(
      <MantineProvider env="test">
        <BookImportPreview
          preview={preview}
          importing={false}
          onBack={vi.fn()}
          onImport={vi.fn()}
        />
      </MantineProvider>,
    );

    expect(
      screen.getByRole("complementary", { name: "書籍インポート操作" }),
    ).toHaveStyle({ position: "fixed", bottom: "0px" });
    expect(
      screen.getByRole("button", { name: "2冊をインポート" }),
    ).toBeEnabled();
    expect(screen.getByText("購入日: 2024-05-01")).toBeInTheDocument();
  });

  test("disables back and import while importing", () => {
    render(
      <MantineProvider env="test">
        <BookImportPreview
          preview={preview}
          importing
          onBack={vi.fn()}
          onImport={vi.fn()}
        />
      </MantineProvider>,
    );

    expect(
      screen.getByRole("button", { name: "入力・設定に戻る" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "2冊をインポート" }),
    ).toBeDisabled();
  });
});
