import {
  backupFilename,
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
