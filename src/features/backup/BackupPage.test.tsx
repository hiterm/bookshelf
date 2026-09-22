import { MantineProvider } from "@mantine/core";
import * as backupActual from "./backupDownload" with {
  rstest: "importActual",
};
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rs } from "@rstest/core";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { BackupPage } from "./BackupPage";
import { downloadBackup } from "./backupDownload";

const getAccessTokenSilently = rs.fn().mockResolvedValue("token");
const reportError = rs.fn();

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: rs.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: rs.fn(),
      removeListener: rs.fn(),
      addEventListener: rs.fn(),
      removeEventListener: rs.fn(),
      dispatchEvent: rs.fn(),
    })),
  });
});

rs.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently }),
}));
rs.mock("../../components/errors/AppErrorProvider", () => ({
  useAppError: rs.fn(),
}));
rs.mock<typeof import("./backupDownload")>("./backupDownload", () => ({
  ...backupActual,
  downloadBackup: rs.fn<typeof downloadBackup>(),
}));

const renderPage = (): ReturnType<typeof render> =>
  render(<BackupPage />, {
    wrapper: ({ children }) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });

describe("BackupPage", () => {
  beforeEach(() => {
    rs.mocked(useAppError).mockReturnValue({
      errors: [],
      reportError,
      dismissError: rs.fn(),
      dismissAllErrors: rs.fn(),
    });
    rs.mocked(downloadBackup).mockReset().mockResolvedValue(undefined);
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
    rs.mocked(downloadBackup).mockImplementation(
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
    await waitFor(() => {
      expect(snapshot).toBeEnabled();
    });
  });

  test("reports errors", async () => {
    const error = new Error("failed");
    rs.mocked(downloadBackup).mockRejectedValue(error);
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
