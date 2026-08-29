import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { AppErrorProvider } from "../../../components/errors/AppErrorProvider";
import { ErrorPanel } from "../../../components/errors/ErrorPanel";
import { useImportBooks } from "../api/useImportBooks";
import { usePreviewBookImport } from "../api/usePreviewBookImport";
import { BookImportPage } from "./BookImportPage";

const importMutateAsync = vi.fn();
const previewMutateAsync = vi.fn();
const navigate = vi.fn();

vi.mock(import("../api/useImportBooks"));
vi.mock(import("../api/usePreviewBookImport"));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

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
    authors: "Smith, John",
    acquiredTime: new Date(2026, 3, 24, 12).getTime(),
    readStatus: "UNKNOWN",
    asin: "B0PAGE001",
  },
  {
    title: "購入日後の本",
    authors: "山田太郎, 鈴木花子",
    acquiredTime: new Date(2026, 3, 26, 8).getTime(),
    readStatus: "READ",
    asin: "B0PAGE002",
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
        isbn: "",
        read: true,
        owned: false,
        priority: 75,
        format: "PRINTED" as const,
        store: "UNKNOWN" as const,
      },
    ],
  },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider env="test">
    <AppErrorProvider>
      <ErrorPanel />
      {children}
    </AppErrorProvider>
  </MantineProvider>
);

const getFileInput = () => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (input == null) throw new Error("File input was not rendered");
  return input;
};

const upload = async (contents: unknown = fixture) => {
  const text = JSON.stringify(contents);
  const file = new File([text], "kindle.json", { type: "application/json" });
  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(text),
  });
  await userEvent.upload(getFileInput(), file);
};

describe("BookImportPage", () => {
  beforeEach(() => {
    importMutateAsync.mockReset();
    previewMutateAsync.mockReset();
    navigate.mockReset().mockResolvedValue(undefined);
    vi.mocked(showNotification).mockReset();
    vi.mocked(useImportBooks, { partial: true }).mockReturnValue({
      mutateAsync: importMutateAsync,
      isPending: false,
    });
    vi.mocked(usePreviewBookImport, { partial: true }).mockReturnValue({
      mutateAsync: previewMutateAsync,
      isPending: false,
    });
  });

  test("loads equivalent file and text input and reports invalid input", async () => {
    render(<BookImportPage />, { wrapper });
    await upload();
    expect(await screen.findByText("購入日前の本")).toBeInTheDocument();
    await userEvent.click(screen.getByText("テキスト"));
    expect(screen.getByText("購入日前の本")).toBeInTheDocument();
    await userEvent.type(
      screen.getByLabelText("Kindle Bookshelf ExporterのJSONテキスト"),
      "not JSON",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "テキストを読み込む" }),
    );
    expect(
      await screen.findByText("入力を読み込めませんでした"),
    ).toBeInTheDocument();
    expect(screen.getByText("購入日前の本")).toBeInTheDocument();
  });

  test("ignores a stale file read after a newer source", async () => {
    render(<BookImportPage />, { wrapper });
    let resolveFirst: ((value: string) => void) | undefined;
    let resolveSecond: ((value: string) => void) | undefined;
    const first = new File([], "first.json", { type: "application/json" });
    const second = new File([], "second.json", { type: "application/json" });
    Object.defineProperty(first, "text", {
      value: () => new Promise<string>((resolve) => (resolveFirst = resolve)),
    });
    Object.defineProperty(second, "text", {
      value: () => new Promise<string>((resolve) => (resolveSecond = resolve)),
    });
    fireEvent.change(getFileInput(), { target: { files: [first] } });
    fireEvent.change(getFileInput(), { target: { files: [second] } });
    resolveSecond?.(JSON.stringify([{ ...fixture[0], title: "新しい入力" }]));
    expect(await screen.findByText("新しい入力")).toBeInTheDocument();
    resolveFirst?.(JSON.stringify([{ ...fixture[0], title: "古い入力" }]));
    await waitFor(() => {
      expect(screen.queryByText("古い入力")).not.toBeInTheDocument();
    });
  });

  test("previews only selected books in the purchase-date scope", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportPage />, { wrapper });
    await upload();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    expect(screen.queryByText("購入日前の本")).not.toBeInTheDocument();
    expect(screen.getByText("インポート対象: 1")).toBeInTheDocument();
    expect(screen.getByText("対象 1冊")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledOnce();
    });
    expect(previewMutateAsync.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({ title: "購入日後の本" }),
    ]);

    await userEvent.click(
      screen.getByRole("button", { name: "入力・設定に戻る" }),
    );
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-24" },
    });
    expect(screen.getByText("インポート対象: 2")).toBeInTheDocument();
    expect(screen.getByText("対象 2冊")).toBeInTheDocument();
  });

  test("combines the inclusive date boundary with manual selection", async () => {
    render(<BookImportPage />, { wrapper });
    await upload();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-24" },
    });
    expect(screen.getByText("インポート対象: 2")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("checkbox", { name: "購入日後の本をインポート" }),
    );
    expect(screen.getByText("インポート対象: 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    expect(screen.getByText("インポート対象: 0")).toBeInTheDocument();
    expect(screen.getByText("対象 0冊")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "プレビュー" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "プレビュー（モバイル固定）" }),
    ).toBeDisabled();
  });

  test("keeps hidden selection while changing only visible selection", async () => {
    render(<BookImportPage />, { wrapper });
    await upload();
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "表示中をすべて解除" }),
    );
    expect(screen.getByText("インポート対象: 0")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "表示中をすべて選択" }),
    );
    expect(screen.getByText("インポート対象: 1")).toBeInTheDocument();
  });

  test("changing the purchase date invalidates a successful preview", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportPage />, { wrapper });
    await upload();
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await screen.findByText("インポートプレビュー");
    await userEvent.click(
      screen.getByRole("button", { name: "入力・設定に戻る" }),
    );
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledTimes(2);
    });
    expect(previewMutateAsync.mock.calls[1]?.[0]).toEqual([
      expect.objectContaining({ title: "購入日後の本" }),
    ]);
  });

  test("orders source, settings, controls, and books for the mobile flow", async () => {
    render(<BookImportPage />, { wrapper });
    await upload();

    const source = screen.getByRole("radiogroup", { name: "入力方法" });
    const settings = screen.getByText("共通設定");
    const filter = screen.getByLabelText("購入日（指定日以降）");
    const book = screen.getByText("購入日前の本");
    const follows = (earlier: Node, later: Node) =>
      Boolean(
        earlier.compareDocumentPosition(later) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );

    expect(follows(source, settings)).toBe(true);
    expect(follows(settings, filter)).toBe(true);
    expect(follows(filter, book)).toBe(true);
  });

  test("previews edited settings and per-book author splitting", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportPage />, { wrapper });
    await upload([fixture[1]]);
    expect(screen.getByText("山田太郎, 鈴木花子")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "購入日後の本の著者をカンマで分割",
      }),
    );
    expect(screen.getByText("山田太郎 / 鈴木花子")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("所有している"));
    fireEvent.change(screen.getByLabelText("優先度"), {
      target: { value: "75" },
    });
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledOnce();
    });
    expect(previewMutateAsync).toHaveBeenCalledWith([
      expect.objectContaining({
        authorNames: ["山田太郎", "鈴木花子"],
        owned: false,
        priority: 75,
      }),
    ]);
    expect(await screen.findByText("インポートプレビュー")).toBeInTheDocument();
    expect(screen.getByText("新規著者: 1")).toBeInTheDocument();
    expect(screen.getByText("既存著者: 1")).toBeInTheDocument();
  });

  test("bulk-splits only visible authors and allows an individual override", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportPage />, { wrapper });
    await upload();

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "購入日前の本の著者をカンマで分割",
      }),
    );
    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "2026-04-25" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "表示中の著者をすべて分割" }),
    );
    expect(screen.getByText("山田太郎 / 鈴木花子")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", {
        name: "表示中の著者をすべて分割しない",
      }),
    );
    expect(screen.getByText("山田太郎, 鈴木花子")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("購入日（指定日以降）"), {
      target: { value: "" },
    });
    expect(screen.getByText("Smith / John")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "購入日後の本の著者をカンマで分割",
      }),
    );
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));

    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledOnce();
    });
    expect(previewMutateAsync).toHaveBeenCalledWith([
      expect.objectContaining({ authorNames: ["Smith", "John"] }),
      expect.objectContaining({ authorNames: ["山田太郎", "鈴木花子"] }),
    ]);
  });

  test("bulk author changes invalidate a previous preview", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    render(<BookImportPage />, { wrapper });
    await upload([fixture[1]]);
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await screen.findByText("インポートプレビュー");
    await userEvent.click(
      screen.getByRole("button", { name: "入力・設定に戻る" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "表示中の著者をすべて分割" }),
    );
    expect(screen.queryByText("インポートプレビュー")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await waitFor(() => {
      expect(previewMutateAsync).toHaveBeenCalledTimes(2);
    });
    expect(previewMutateAsync.mock.calls[1]?.[0]).toEqual([
      expect.objectContaining({ authorNames: ["山田太郎", "鈴木花子"] }),
    ]);
  });

  test("imports the exact previewed array and navigates to books", async () => {
    previewMutateAsync.mockResolvedValue(previewResponse);
    importMutateAsync.mockResolvedValue({
      importBooks: { books: [{ id: "1", title: "本" }] },
    });
    render(<BookImportPage />, { wrapper });
    await upload([fixture[0]]);
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await screen.findByText("インポートプレビュー");
    await userEvent.click(
      screen.getByRole("button", { name: "1冊をインポート" }),
    );
    await waitFor(() => {
      expect(importMutateAsync).toHaveBeenCalledOnce();
    });
    expect(importMutateAsync.mock.calls[0]?.[0]).toBe(
      previewMutateAsync.mock.calls[0]?.[0],
    );
    expect(navigate).toHaveBeenCalledWith({ to: "/books" });
  });

  test("keeps preview after import failure and editor after preview failure", async () => {
    previewMutateAsync.mockRejectedValueOnce(new Error("preview failed"));
    render(<BookImportPage />, { wrapper });
    await upload([fixture[0]]);
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    expect(
      await screen.findByText("書籍インポートのプレビューに失敗しました"),
    ).toBeInTheDocument();
    expect(screen.getByText("購入日前の本")).toBeInTheDocument();

    previewMutateAsync.mockResolvedValueOnce(previewResponse);
    importMutateAsync.mockRejectedValueOnce(new Error("import failed"));
    await userEvent.click(screen.getByRole("button", { name: "プレビュー" }));
    await screen.findByText("インポートプレビュー");
    await userEvent.click(
      screen.getByRole("button", { name: "1冊をインポート" }),
    );
    expect(
      await screen.findByText("書籍のインポートに失敗しました"),
    ).toBeInTheDocument();
    expect(screen.getByText("インポートプレビュー")).toBeInTheDocument();
  });
});
