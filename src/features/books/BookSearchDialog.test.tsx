import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BookSearchDialog } from "./BookSearchDialog";
import { BookSearchResult, BookSearchState } from "./useBookSearch";

const mockSearch = vi.fn();
let mockState: BookSearchState = { status: "idle" };

vi.mock("./useBookSearch", () => ({
  useBookSearch: () => ({
    state: mockState,
    search: mockSearch,
  }),
}));

beforeAll(() => {
  // Test stub; methods are intentionally no-ops.
  /* eslint-disable @typescript-eslint/no-empty-function */
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  /* eslint-enable @typescript-eslint/no-empty-function */
});

const mockMatchMedia = () => {
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
};

const renderDialog = (props: {
  opened?: boolean;
  onClose?: () => void;
  onSelect?: (result: BookSearchResult) => void;
}) => {
  mockMatchMedia();
  return render(
    <MantineProvider>
      <BookSearchDialog
        opened={props.opened ?? true}
        onClose={props.onClose ?? vi.fn()}
        onSelect={props.onSelect ?? vi.fn()}
      />
    </MantineProvider>,
  );
};

beforeEach(() => {
  mockState = { status: "idle" };
  mockSearch.mockReset();
});

describe("BookSearchDialog", () => {
  test("renders four TextInputs and a SegmentedControl when open", async () => {
    renderDialog({});

    expect(
      await screen.findByRole("textbox", { name: "書名" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "著者名" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "出版社" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "ISBN" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Google Books" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "NDL（国立国会図書館）" }),
    ).toBeInTheDocument();
  });

  test("検索 button is disabled when all fields are empty", async () => {
    renderDialog({});

    expect(await screen.findByRole("button", { name: "検索" })).toBeDisabled();
  });

  test("clicking 検索 with a title value triggers search and shows results", async () => {
    const user = userEvent.setup();
    const sampleResult: BookSearchResult = {
      title: "Rustプログラミング",
      authorNames: ["著者A"],
      isbn: "9784065362433",
      publisher: "講談社",
    };
    mockSearch.mockImplementation(() => {
      mockState = { status: "success", results: [sampleResult] };
    });

    const { rerender } = renderDialog({});

    const titleInput = await screen.findByRole("textbox", { name: "書名" });
    await user.type(titleInput, "Rust");

    const searchButton = screen.getByRole("button", { name: "検索" });
    await user.click(searchButton);

    rerender(
      <MantineProvider>
        <BookSearchDialog opened={true} onClose={vi.fn()} onSelect={vi.fn()} />
      </MantineProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Rustプログラミング")).toBeInTheDocument();
    });
  });

  test("clicking a result calls onSelect with correct BookSearchResult", async () => {
    const sampleResult: BookSearchResult = {
      title: "テスト書籍",
      authorNames: ["著者X"],
      isbn: "9784000000001",
      publisher: "テスト出版",
    };
    mockState = { status: "success", results: [sampleResult] };

    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    renderDialog({ onSelect, onClose });

    await user.click(await screen.findByText("テスト書籍"));

    expect(onSelect).toHaveBeenCalledWith(sampleResult);
    expect(onClose).toHaveBeenCalled();
  });

  test("error state shows error text", async () => {
    mockState = { status: "error", message: "取得に失敗しました" };

    renderDialog({});

    expect(await screen.findByText("取得に失敗しました")).toBeInTheDocument();
  });

  test("empty results shows 見つかりませんでした", async () => {
    mockState = { status: "success", results: [] };

    renderDialog({});

    expect(await screen.findByText("見つかりませんでした")).toBeInTheDocument();
  });

  test("switching SegmentedControl to NDL and clicking 検索 calls NDL endpoint", async () => {
    const user = userEvent.setup();
    mockSearch.mockResolvedValue(undefined);

    renderDialog({});

    const titleInput = await screen.findByRole("textbox", { name: "書名" });
    await user.type(titleInput, "プログラミング");

    const ndlOption = screen.getByRole("radio", {
      name: "NDL（国立国会図書館）",
    });
    await user.click(ndlOption);

    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ title: "プログラミング" }),
      "ndl",
    );
  });
});
