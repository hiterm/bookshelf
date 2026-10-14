import { vi } from "vitest";
import {
  backupFilename,
  downloadBackup,
  isJsonContentType,
  validateBackupRequestUrl,
} from "./backupDownload";

describe("backupFilename", () => {
  const date = new Date("2026-09-13T01:23:45.678Z");

  test("generates a safe snapshot filename", () => {
    expect(backupFilename("snapshot", date)).toBe(
      "bookshelf-backup-snapshot-2026-09-13T012345Z.json",
    );
  });

  test("generates a safe full filename", () => {
    expect(backupFilename("full", date)).toBe(
      "bookshelf-backup-full-2026-09-13T012345Z.json",
    );
  });
});

describe("isJsonContentType", () => {
  test.each([
    "application/json",
    "application/json; charset=utf-8",
    "application/problem+json",
  ])("accepts %s", (contentType) => {
    expect(isJsonContentType(contentType)).toBe(true);
  });

  test.each([null, "", "text/html", "text/plain; charset=utf-8"])(
    "rejects %s",
    (contentType) => {
      expect(isJsonContentType(contentType)).toBe(false);
    },
  );
});

describe("validateBackupRequestUrl", () => {
  test("accepts HTTPS", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("https://api.example.com/v1/backup/full"),
        false,
      );
    }).not.toThrow();
  });

  test("rejects public cleartext destinations", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("http://api.example.com/v1/backup/full"),
        false,
      );
    }).toThrow("HTTPS");
  });

  test("allows loopback HTTP for local development", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("http://localhost:4000/v1/backup/full"),
        false,
      );
    }).not.toThrow();
  });
});

const config = vi.hoisted(() => ({
  isDemoMode: false,
  apiBaseUrl: "https://api.example.com",
}));
vi.mock("../../config", () => config);

describe("downloadBackup", () => {
  afterEach(() => {
    config.isDemoMode = false;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test.each([undefined, ""])("rejects a missing token (%s)", async (token) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      downloadBackup("snapshot", () => Promise.resolve(token)),
    ).rejects.toThrow("アクセストークンを取得できませんでした");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([false, true])(
    "downloads a backup with demo mode %s",
    async (demoMode) => {
      config.isDemoMode = demoMode;
      const getToken = vi
        .fn<() => Promise<string | undefined>>()
        .mockResolvedValue("test-token");
      const response = new Response(JSON.stringify({ books: [] }), {
        headers: { "content-type": "application/json" },
      });
      const blob = new Blob([JSON.stringify({ books: [] })], {
        type: "application/json",
      });
      const readBlob = vi.spyOn(response, "blob").mockResolvedValue(blob);
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
      const createObjectURL = vi
        .fn<typeof URL.createObjectURL>()
        .mockReturnValue("blob:backup-download");
      const revokeObjectURL = vi.fn<typeof URL.revokeObjectURL>();
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal(
        "URL",
        class extends URL {
          static override createObjectURL = createObjectURL;
          static override revokeObjectURL = revokeObjectURL;
        },
      );
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        function (this: HTMLAnchorElement) {
          expect(this.isConnected).toBe(true);
          expect(this.href).toBe("blob:backup-download");
          expect(this.download).toMatch(/^bookshelf-backup-snapshot-.*\.json$/);
        },
      );

      await downloadBackup("snapshot", getToken);

      expect(getToken).toHaveBeenCalledTimes(demoMode ? 0 : 1);
      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBeInstanceOf(URL);
      expect(url).toHaveProperty(
        "href",
        "https://api.example.com/v1/backup/snapshot",
      );
      expect(options?.method).toBe("GET");
      expect(new Headers(options?.headers).get("authorization")).toBe(
        demoMode ? null : "Bearer test-token",
      );
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(readBlob).toHaveBeenCalledOnce();
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(
        document.querySelector('a[href="blob:backup-download"]'),
      ).toBeNull();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup-download");
    },
  );
});
