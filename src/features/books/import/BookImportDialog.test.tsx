import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { AppErrorProvider } from "../../../compoments/errors/AppErrorProvider";
import { useImportBooks } from "../../../compoments/hooks/useImportBooks";
import { usePreviewBookImport } from "../../../compoments/hooks/usePreviewBookImport";
import { BookImportDialog } from "./BookImportDialog";

const importMutateAsync = vi.fn();
const previewMutateAsync = vi.fn();

vi.mock(import("../../../compoments/hooks/useImportBooks"));
vi.mock(import("../../../compoments/hooks/usePreviewBookImport"));
vi.mocked(useImportBooks, { partial: true }).mockReturnValue({
  mutateAsync: importMutateAsync,
  isPending: false,
});
vi.mocked(usePreviewBookImport, { partial: true }).mockReturnValue({
  mutateAsync: previewMutateAsync,
  isPending: false,
});
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

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

const previewResponse = {
  previewBookImport: {
    books: [
      {
        title: "正規化された本",
        authors: [
          { name: "既存著者", status: "EXISTING" as const },
          { name: "新規著者", status: "NEW" as const },
        ],
        isbn: "978-4-00-000001-0",
        read: true,
        owned: true,
        priority: 50,
        format: "E_BOOK" as const,
        store: "KINDLE" as const,
      },
    ],
  },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider env="test">
    <AppErrorProvider>{children}</AppErrorProvider>
  </MantineProvider>
);

const getFileInput = () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (input == null) throw new Error("File input was not rendered");
  return input;
};

const uploadJson = async (
  contents: unknown = fixture,
  name = "kindle.json",
) => {
  const user = userEvent.setup();
  const text = JSON.stringify(contents);
  const file = new File([text], name, { type: "application/json" });
  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(text),
  });
  await user.upload(getFileInput(), file);
  return user;
};

const runSuccessfulPreview = async () => {
  previewMutateAsync.mockResolvedValueOnce(previewResponse);
  await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
  await screen.findByText("インポート内容");
};

describe("BookImportDialog", () => {
  beforeEach(() => {
    importMutateAsync.mockReset();
    previewMutateAsync.mockReset();
    vi.mocked(showNotification).mockReset();
  });

  test("shows exporter books as import candidates", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    expect(await screen.findByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByText("著者 二, 著者 三")).toBeInTheDocument();
    expect(screen.getByText("2026-04-25")).toBeInTheDocument();
    expect(screen.getByText("全件数: 3")).toBeInTheDocument();
    expect(screen.getByText("条件該当件数: 3")).toBeInTheDocument();
    expect(screen.getByText("選択件数: 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "プレビュー" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();
  });

  test("ignores a stale file read that finishes after a newer file", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    let resolveFirst: ((value: string) => void) | undefined;
    let resolveSecond: ((value: string) => void) | undefined;
    const firstFile = new File([], "first.json", { type: "application/json" });
    const secondFile = new File([], "second.json", {
      type: "application/json",
    });
    Object.defineProperty(firstFile, "text", {
      value: () => new Promise<string>((resolve) => (resolveFirst = resolve)),
    });
    Object.defineProperty(secondFile, "text", {
      value: () => new Promise<string>((resolve) => (resolveSecond = resolve)),
    });
    fireEvent.change(getFileInput(), { target: { files: [firstFile] } });
    fireEvent.change(getFileInput(), { target: { files: [secondFile] } });
    resolveSecond?.(JSON.stringify([{ ...fixture[0], title: "新しい選択" }]));
    expect(await screen.findByText("新しい選択")).toBeInTheDocument();
    resolveFirst?.(JSON.stringify([{ ...fixture[0], title: "古い選択" }]));
    await waitFor(() => {
      expect(screen.queryByText("古い選択")).not.toBeInTheDocument();
    });
  });

  test("filters purchase dates inclusively and supports selection", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = await uploadJson();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    expect(screen.queryByText("購入日前の本")).not.toBeInTheDocument();
    expect(screen.getByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByText("条件該当件数: 2")).toBeInTheDocument();
    await user.click(
      screen.getByRole("checkbox", { name: "購入日後の本をインポート" }),
    );
    expect(screen.getByText("選択件数: 1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "すべて解除" }));
    expect(screen.getByText("選択件数: 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "プレビュー" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "すべて選択" }));
    expect(screen.getByText("選択件数: 2")).toBeInTheDocument();
  });

  test("previews only selected visible inputs and displays backend normalization", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    const user = await uploadJson();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await user.click(
      screen.getByRole("checkbox", { name: "購入日後の本をインポート" }),
    );
    await user.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledOnce();
    });
    expect(previewMutateAsync).toHaveBeenCalledWith([
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
    expect(await screen.findByText("正規化された本")).toBeInTheDocument();
    expect(screen.getByText("既存著者")).toBeInTheDocument();
    expect(screen.getByText("既存")).toBeInTheDocument();
    expect(screen.getByText("新規著者")).toBeInTheDocument();
    expect(screen.getByText("新規")).toBeInTheDocument();
    expect(screen.getByText("1冊をインポートします")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "再プレビュー" })).toBeEnabled();
  });

  test("imports the exact input array captured by preview", async () => {
    importMutateAsync.mockResolvedValue({
      importBooks: { books: [{ id: "book-1", title: "購入日前の本" }] },
    });
    const onClose = vi.fn();
    render(<BookImportDialog opened onClose={onClose} />, { wrapper });
    await uploadJson([fixture[0]]);
    await runSuccessfulPreview();
    await userEvent.click(screen.getByRole("button", { name: "インポート" }));
    await waitFor(() => {
      expect(importMutateAsync).toHaveBeenCalledOnce();
    });
    expect(importMutateAsync.mock.calls[0]?.[0]).toBe(
      previewMutateAsync.mock.calls[0]?.[0],
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: "1冊をインポートしました" }),
    );
  });

  test.each([
    [
      "checkbox",
      async () => userEvent.click(screen.getAllByRole("checkbox")[0]),
    ],
    [
      "date filter",
      () =>
        fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
          target: { value: "2026-04-25" },
        }),
    ],
  ])("invalidates preview after a %s change", async (_name, change) => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    await runSuccessfulPreview();
    await Promise.resolve(change());
    expect(screen.queryByText("インポート内容")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "プレビュー" })).toBeEnabled();
  });

  test("invalidates preview when another file is selected", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    await runSuccessfulPreview();
    await uploadJson(
      [{ ...fixture[0], title: "別ファイルの本" }],
      "other.json",
    );
    expect(await screen.findByText("別ファイルの本")).toBeInTheDocument();
    expect(screen.queryByText("インポート内容")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();
  });

  test("keeps inputs and disables import after preview failure", async () => {
    previewMutateAsync.mockRejectedValue(new Error("preview unavailable"));
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledOnce();
    });
    expect(screen.getByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByLabelText("購入日（指定日以降）")).toHaveValue(
      "2026-04-25",
    );
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });

  test("clears a successful preview when re-preview fails", async () => {
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    await runSuccessfulPreview();
    previewMutateAsync.mockRejectedValueOnce(
      new Error("re-preview unavailable"),
    );

    await userEvent.click(screen.getByRole("button", { name: "再プレビュー" }));

    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByText("インポート内容")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "プレビュー" })).toBeEnabled();
  });

  test("keeps inputs and preview after import failure", async () => {
    importMutateAsync.mockRejectedValue(new Error("import unavailable"));
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson();
    await runSuccessfulPreview();
    await userEvent.click(screen.getByRole("button", { name: "インポート" }));
    await waitFor(() => {
      expect(importMutateAsync).toHaveBeenCalledOnce();
    });
    expect(screen.getByText("購入日当日の本")).toBeInTheDocument();
    expect(screen.getByText("インポート内容")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "インポート" })).toBeEnabled();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });

  test("prevents duplicate preview submission while pending", async () => {
    let resolvePreview: ((value: typeof previewResponse) => void) | undefined;
    previewMutateAsync.mockImplementation(
      () => new Promise((resolve) => (resolvePreview = resolve)),
    );
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson([fixture[0]]);
    const button = screen.getByRole("button", { name: "プレビュー" });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(previewMutateAsync).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    resolvePreview?.(previewResponse);
  });

  test("prevents duplicate import submission while pending", async () => {
    let resolveImport: ((value: unknown) => void) | undefined;
    importMutateAsync.mockImplementation(
      () => new Promise((resolve) => (resolveImport = resolve)),
    );
    render(<BookImportDialog opened onClose={vi.fn()} />, { wrapper });
    await uploadJson([fixture[0]]);
    await runSuccessfulPreview();
    const button = screen.getByRole("button", { name: "インポート" });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(importMutateAsync).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    resolveImport?.({ importBooks: { books: [] } });
  });

  test("rejects invalid JSON without exposing actions or calling mutations", async () => {
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
    expect(screen.queryByRole("button", { name: "プレビュー" })).toBeNull();
    expect(importMutateAsync).not.toHaveBeenCalled();
    expect(previewMutateAsync).not.toHaveBeenCalled();
  });
});
