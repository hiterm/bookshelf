import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { BackupPage } from "./BackupPage";
import { downloadBackup } from "./backupDownload";

const getAccessTokenSilently = vi.fn().mockResolvedValue("token");
const reportError = vi.fn();

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

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently }),
}));
vi.mock("../../components/errors/AppErrorProvider", () => ({
  useAppError: vi.fn(),
}));
vi.mock("./backupDownload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./backupDownload")>()),
  downloadBackup: vi.fn(),
}));

const renderPage = () =>
  render(<BackupPage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

describe("BackupPage", () => {
  beforeEach(() => {
    vi.mocked(useAppError).mockReturnValue({
      errors: [],
      reportError,
      dismissError: vi.fn(),
      dismissAllErrors: vi.fn(),
    });
    vi.mocked(downloadBackup).mockReset().mockResolvedValue(undefined);
    reportError.mockReset();
  });

  test("presents snapshot and full exports", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "バックアップ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "スナップショットをエクスポート" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "完全バックアップをエクスポート" }),
    ).toBeInTheDocument();
  });

  test.each([
    ["スナップショットをエクスポート", "snapshot"],
    ["完全バックアップをエクスポート", "full"],
  ] as const)("downloads from %s", async (label, scope) => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: label }));
    await waitFor(() => {
      expect(downloadBackup).toHaveBeenCalledWith(
        scope,
        getAccessTokenSilently,
      );
    });
  });

  test("disables only the pending export", async () => {
    let finish: (() => void) | undefined;
    vi.mocked(downloadBackup).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    renderPage();
    const snapshot = screen.getByRole("button", {
      name: "スナップショットをエクスポート",
    });
    const full = screen.getByRole("button", {
      name: "完全バックアップをエクスポート",
    });
    await userEvent.click(snapshot);
    expect(snapshot).toBeDisabled();
    expect(full).toBeEnabled();
    finish?.();
  });

  test("reports errors", async () => {
    const error = new Error("failed");
    vi.mocked(downloadBackup).mockRejectedValue(error);
    renderPage();
    await userEvent.click(
      screen.getByRole("button", { name: "完全バックアップをエクスポート" }),
    );
    await waitFor(() => {
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ error }),
      );
    });
  });
});
