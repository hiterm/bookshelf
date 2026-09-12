import { apiBaseUrl, isDemoMode } from "../../config";

export type BackupScope = "snapshot" | "full";

export const backupFilename = (scope: BackupScope, date: Date): string =>
  `bookshelf-backup-${scope}-${date
    .toISOString()
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z")}.json`;

const responseError = async (response: Response): Promise<Error> => {
  try {
    const value: unknown = await response.json();
    if (
      typeof value === "object" &&
      value != null &&
      "message" in value &&
      typeof value.message === "string"
    ) {
      return new Error(value.message);
    }
  } catch {
    // The status remains useful when an upstream proxy returns a non-JSON body.
  }
  return new Error(
    `バックアップの取得に失敗しました (${String(response.status)})`,
  );
};

export const validateBackupRequestUrl = (
  requestUrl: URL,
  demoMode: boolean,
): void => {
  const isLoopback =
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname === "127.0.0.1" ||
    requestUrl.hostname === "[::1]";
  if (!demoMode && requestUrl.protocol !== "https:" && !isLoopback) {
    throw new Error("バックアップ API は HTTPS である必要があります");
  }
};

export const downloadBackup = async (
  scope: BackupScope,
  getAccessTokenSilently: () => Promise<string>,
): Promise<void> => {
  const requestUrl = new URL(
    `${apiBaseUrl}/v1/backup/${scope}`,
    window.location.origin,
  );
  validateBackupRequestUrl(requestUrl, isDemoMode);
  const token = isDemoMode ? "" : await getAccessTokenSilently();
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: token === "" ? {} : { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw await responseError(response);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = backupFilename(scope, new Date());
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
