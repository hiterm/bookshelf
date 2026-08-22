import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { showNotification } from "@mantine/notifications";
import { useImportBooks } from "../../../compoments/hooks/useImportBooks";
import { BookImportDialog } from "./BookImportDialog";

const mutateAsync = vi.fn();

vi.mock(import("../../../compoments/hooks/useImportBooks"));
vi.mocked(useImportBooks, { partial: true }).mockReturnValue({
  mutateAsync,
  isPending: false,
});

vi.mock("@mantine/notifications", () => ({
  showNotification: vi.fn(),
}));

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

  // Test stub; methods are intentionally no-ops.
  /* eslint-disable @typescript-eslint/no-empty-function */
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  /* eslint-enable @typescript-eslint/no-empty-function */
});

const fixture = [
  {
    title: "購入日前の本",
    authors: "著者 一",
    acquiredTime: new Date(2026, 3, 24, 12).getTime(),
    readStatus: "UNKNOWN",
    asin: "B0DIALOG001",
    productImage: "https://example.com/1.jpg",
  },
  {
    title: "購入日当日の本",
    authors: "著者 二, 著者 三",
    acquiredTime: new Date(2026, 3, 25, 0).getTime(),
    readStatus: "READ",
    asin: "B0DIALOG002",
    productImage: "https://example.com/2.jpg",
  },
  {
    title: "購入日後の本",
    authors: "著者 四",
    acquiredTime: new Date(2026, 3, 26, 8).getTime(),
    readStatus: "UNKNOWN",
    asin: "B0DIALOG003",
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider env="test">{children}</MantineProvider>
);

const getFileInput = () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (input == null) throw new Error("File input was not rendered");
  return input;
};

const uploadJson = async (contents: unknown = fixture) => {
  const user = userEvent.setup();
  const file = new File([JSON.stringify(contents)], "kindle.json", {
    type: "application/json",
  });
  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(JSON.stringify(contents)),
  });
  await user.upload(getFileInput(), file);
  return user;
};

describe("BookImportDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    vi.mocked(showNotification).mockReset();
  });

  test("previews exporter books and their normalized fields", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });

    await uploadJson();

    expect(await screen.findByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByText("著者 二, 著者 三")).toBeInTheDocument();
    expect(screen.getByText("2026-04-25")).toBeInTheDocument();
    expect(screen.getByText("既読")).toBeInTheDocument();
    expect(screen.getAllByText("未読")).toHaveLength(2);
    expect(screen.getByText("全件数: 3")).toBeInTheDocument();
    expect(screen.getByText("条件該当件数: 3")).toBeInTheDocument();
    expect(screen.getByText("選択件数: 3")).toBeInTheDocument();
  });

  test("filters inclusively without losing the uploaded source books", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();

    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });

    expect(screen.queryByText("購入日前の本")).not.toBeInTheDocument();
    expect(screen.getByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByText("条件該当件数: 2")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "" },
    });
    expect(screen.getByText("購入日前の本")).toBeInTheDocument();
    expect(screen.getByText("全件数: 3")).toBeInTheDocument();
  });

  test("supports individual and bulk selection", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = await uploadJson();
    const firstBook = screen.getByRole("checkbox", {
      name: "購入日前の本をインポート",
    });

    await user.click(firstBook);
    expect(firstBook).not.toBeChecked();
    expect(screen.getByText("選択件数: 2")).toBeInTheDocument();

    await user.click(firstBook);
    expect(firstBook).toBeChecked();

    await user.click(screen.getByRole("button", { name: "すべて解除" }));
    expect(screen.getByText("選択件数: 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "すべて選択" }));
    expect(screen.getByText("選択件数: 3")).toBeInTheDocument();
  });

  test("submits only selected visible books in one generated input array", async () => {
    mutateAsync.mockResolvedValue({
      importBooks: { books: [{ id: "book-1", title: "購入日当日の本" }] },
    });
    const onClose = vi.fn();
    render(<BookImportDialog opened onClose={onClose} />, { wrapper });
    const user = await uploadJson();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await user.click(
      screen.getByRole("checkbox", { name: "購入日後の本をインポート" }),
    );

    await user.click(screen.getByRole("button", { name: "インポート" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mutateAsync).toHaveBeenCalledWith([
      {
        title: "購入日当日の本",
        authorNames: ["著者 二, 著者 三"],
        isbn: "",
        read: true,
        owned: true,
        priority: 50,
        format: "E_BOOK",
        store: "KINDLE",
      },
    ]);
    expect(onClose).toHaveBeenCalledOnce();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: "1冊をインポートしました" }),
    );
  });

  test("prevents duplicate submission while the bulk mutation is pending", async () => {
    let resolveMutation: ((value: unknown) => void) | undefined;
    mutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        }),
    );
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = await uploadJson([fixture[0]]);
    const submit = screen.getByRole("button", { name: "インポート" });

    await user.click(submit);
    await user.click(submit);

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();
    resolveMutation?.({
      importBooks: { books: [{ id: "book-1", title: fixture[0].title }] },
    });
  });

  test("keeps the file, filter, and selection after a mutation failure", async () => {
    mutateAsync.mockRejectedValue(new Error("backend unavailable"));
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = await uploadJson();
    const dateInput = screen.getByLabelText("購入日（指定日以降）");
    fireEvent.change(dateInput, { target: { value: "2026-04-25" } });
    const laterBook = screen.getByRole("checkbox", {
      name: "購入日後の本をインポート",
    });
    await user.click(laterBook);

    await user.click(screen.getByRole("button", { name: "インポート" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce();
    });
    expect(screen.getByText("購入日当日の本")).toBeInTheDocument();
    expect(dateInput).toHaveValue("2026-04-25");
    expect(laterBook).not.toBeChecked();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });

  test("rejects invalid JSON without exposing preview or calling mutation", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = userEvent.setup();
    const file = new File(["invalid"], "kindle.json", {
      type: "application/json",
    });
    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue("invalid"),
    });

    await user.upload(getFileInput(), file);

    expect(
      await screen.findByText("ファイルを読み込めませんでした"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "インポート" })).toBeNull();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
