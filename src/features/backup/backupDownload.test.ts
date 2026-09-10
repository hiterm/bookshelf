import { filenameFromContentDisposition } from "./backupDownload";

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
