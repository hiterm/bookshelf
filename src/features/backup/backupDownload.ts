import { apiBaseUrl, isDemoMode } from "../../config";

export type BackupScope = "snapshot" | "full";

const fallbackFilename = (scope: BackupScope): string =>
  `bookshelf-backup-${scope}.json`;

export const filenameFromContentDisposition = (
  header: string | null,
  scope: BackupScope,
): string => {
  if (header == null) return fallbackFilename(scope);
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1];
  const regular = /filename="([^"]+)"|filename=([^;\s]+)/i.exec(header);
  let candidate: string;
  try {
    candidate =
      encoded == null
        ? (regular?.[1] ?? regular?.[2] ?? "")
        : decodeURIComponent(encoded);
  } catch {
    return fallbackFilename(scope);
  }
  if (
    candidate === "" ||
    candidate.includes("/") ||
    candidate.includes("\\") ||
    !candidate.toLowerCase().endsWith(".json")
  ) {
    return fallbackFilename(scope);
  }
  return candidate;
};

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

export const downloadBackup = async (
  scope: BackupScope,
  getAccessTokenSilently: () => Promise<string>,
): Promise<void> => {
  const token = isDemoMode ? "" : await getAccessTokenSilently();
  const response = await fetch(`${apiBaseUrl}/backup/${scope}`, {
    method: "GET",
    headers: token === "" ? {} : { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw await responseError(response);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filenameFromContentDisposition(
    response.headers.get("content-disposition"),
    scope,
  );
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
