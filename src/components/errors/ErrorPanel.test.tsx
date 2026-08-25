import { MantineProvider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppError, AppErrorProvider } from "./AppErrorProvider";
import { ErrorPanel } from "./ErrorPanel";

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
});

const Reporter = () => {
  const { reportError } = useAppError();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          reportError({
            title: "書籍の更新に失敗しました",
            operation: "UpdateBook",
            error: new Error("update failed"),
          });
        }}
      >
        report first
      </button>
      <button
        type="button"
        onClick={() => {
          reportError({ title: "削除に失敗しました", error: "delete failed" });
        }}
      >
        report second
      </button>
    </>
  );
};

const renderPanel = () =>
  render(
    <MantineProvider env="test">
      <AppErrorProvider>
        <Reporter />
        <ErrorPanel />
      </AppErrorProvider>
    </MantineProvider>,
  );

describe("ErrorPanel", () => {
  beforeEach(() => vi.mocked(showNotification).mockReset());

  it("is hidden with no errors and keeps reported errors until dismissal", async () => {
    const user = userEvent.setup();
    renderPanel();
    expect(
      screen.queryByTestId("persistent-error-panel"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "report first" }));
    expect(screen.getByText("書籍の更新に失敗しました")).toBeInTheDocument();
    expect(showNotification).toHaveBeenCalledWith({
      message: "書籍の更新に失敗しました",
      color: "red",
    });

    await user.click(screen.getByRole("button", { name: "詳細を表示" }));
    expect(screen.getByText(/Operation: UpdateBook/)).toBeInTheDocument();
    expect(screen.getByText(/Message: update failed/)).toBeInTheDocument();
    expect(screen.getByText(/Details:/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(
      screen.queryByText("書籍の更新に失敗しました"),
    ).not.toBeInTheDocument();
  });

  it("holds multiple errors and supports individual and all dismissal", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("button", { name: "report first" }));
    await user.click(screen.getByRole("button", { name: "report second" }));

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: "閉じる" })[0]);
    expect(
      screen.queryByText("書籍の更新に失敗しました"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("削除に失敗しました")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "report first" }));
    await user.click(screen.getByRole("button", { name: "すべて閉じる" }));
    expect(
      screen.queryByTestId("persistent-error-panel"),
    ).not.toBeInTheDocument();
  });

  it("copies long details in the stable clipboard format", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    renderPanel();
    await user.click(screen.getByRole("button", { name: "report first" }));
    await user.click(screen.getByRole("button", { name: "詳細をコピー" }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringMatching(
        /Title: 書籍の更新に失敗しました\nOperation: UpdateBook\nMessage: update failed\nDetails:\nError: update failed/,
      ),
    );
    expect(showNotification).toHaveBeenLastCalledWith({
      message: "エラー詳細をコピーしました",
      color: "teal",
    });
  });

  it("shows copy failure only as a transient notification", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("denied"),
    );
    renderPanel();
    await user.click(screen.getByRole("button", { name: "report second" }));
    await user.click(screen.getByRole("button", { name: "詳細をコピー" }));

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(showNotification).toHaveBeenLastCalledWith({
      message: "エラー詳細をコピーできませんでした",
      color: "red",
    });
  });
});
import "@testing-library/jest-dom";
