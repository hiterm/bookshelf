import {
  filenameFromContentDisposition,
  validateBackupRequestUrl,
} from "./backupDownload";

describe("filenameFromContentDisposition", () => {
  test("uses a quoted server filename", () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="bookshelf-backup-full-2026-09-11T020000Z.json"',
        "full",
      ),
    ).toBe("bookshelf-backup-full-2026-09-11T020000Z.json");
  });

  test("decodes an RFC 5987 filename", () => {
    expect(
      filenameFromContentDisposition(
        "attachment; filename*=UTF-8''bookshelf-backup-snapshot.json",
        "snapshot",
      ),
    ).toBe("bookshelf-backup-snapshot.json");
  });

  test.each([null, "attachment", 'attachment; filename="../secret.json"'])(
    "uses a safe fallback for %s",
    (header) => {
      expect(filenameFromContentDisposition(header, "snapshot")).toBe(
        "bookshelf-backup-snapshot.json",
      );
    },
  );
});

describe("validateBackupRequestUrl", () => {
  test("accepts HTTPS", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("https://api.example.com/backup/full"),
        false,
      );
    }).not.toThrow();
  });

  test("rejects public cleartext destinations", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("http://api.example.com/backup/full"),
        false,
      );
    }).toThrow("HTTPS");
  });

  test("allows loopback HTTP for local development", () => {
    expect(() => {
      validateBackupRequestUrl(
        new URL("http://localhost:4000/backup/full"),
        false,
      );
    }).not.toThrow();
  });
});
