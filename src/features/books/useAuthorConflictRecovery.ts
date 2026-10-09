import { useAuth0 } from "@auth0/auth0-react";
import { showNotification } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { ClientError } from "graphql-request";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";
import { authorQueryKeys } from "../authors/api/queryKeys";
import { reconcileAuthors } from "./bookAuthorInput";
import type { BookFormAuthor } from "./bookFormSchema";

function isAuthorNameConflict(extensions: unknown): boolean {
  return (
    typeof extensions === "object" &&
    extensions != null &&
    "code" in extensions &&
    extensions.code === "CONFLICT" &&
    "reason" in extensions &&
    extensions.reason === "AUTHOR_NAME_CONFLICT"
  );
}

export function useAuthorConflictRecovery(): (
  error: unknown,
  submitted: BookFormAuthor[],
  getCurrent: () => BookFormAuthor[],
  setAuthors: (authors: BookFormAuthor[]) => void,
) => Promise<boolean> {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return async (error, submitted, getCurrent, setAuthors) => {
    if (
      !(error instanceof ClientError) ||
      error.response.errors?.some((item) =>
        isAuthorNameConflict(item.extensions),
      ) !== true
    )
      return false;
    try {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      // Always request fresh data; a cached/in-flight pre-save query can miss the conflicting author.
      const result = await sdk.authors();
      await client.cancelQueries({ queryKey: authorQueryKeys.all });
      client.setQueryData(authorQueryKeys.all, result);
      const resolved = reconcileAuthors(
        getCurrent(),
        submitted,
        result.authors,
      );
      if (resolved.names.length === 0) return false;
      setAuthors(resolved.authors);
      showNotification({
        color: "yellow",
        message: `${resolved.names.map((name) => `「${name}」`).join("、")}は既存の著者に切り替えました。書籍はまだ保存されていません。内容を確認して保存してください。`,
      });
      return true;
    } catch {
      // The original actionable save error is reported by the caller; keep all input on refresh failure.
      return false;
    }
  };
}
