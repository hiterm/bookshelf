import type { QueryClient } from "@tanstack/react-query";
import { bookQueryKeys } from "../../books/api/queryKeys";
import { invalidateOperations } from "../../history/api/invalidation";
import { authorQueryKeys } from "./queryKeys";

function invalidateAuthorDirectory(client: QueryClient): void {
  void client.invalidateQueries({ queryKey: authorQueryKeys.all });
  invalidateOperations(client);
}

export function invalidateAuthorCreate(client: QueryClient): void {
  invalidateAuthorDirectory(client);
}

export function invalidateAuthorUpdate(
  client: QueryClient,
  authorId: string,
): void {
  invalidateAuthorDirectory(client);
  void client.invalidateQueries({ queryKey: authorQueryKeys.detail(authorId) });
  void client.invalidateQueries({
    queryKey: authorQueryKeys.revisions(authorId),
  });
  // Book responses embed live author names and yomi, unlike revision snapshots.
  void client.invalidateQueries({ queryKey: bookQueryKeys.all });
  void client.invalidateQueries({ queryKey: bookQueryKeys.details });
}

export function invalidateAuthorDelete(
  client: QueryClient,
  authorId: string,
): void {
  invalidateAuthorDirectory(client);
  void client.invalidateQueries({ queryKey: authorQueryKeys.detail(authorId) });
  void client.invalidateQueries({ queryKey: bookQueryKeys.all });
  void client.invalidateQueries({ queryKey: bookQueryKeys.details });
}

export function invalidateAuthorMerge(
  client: QueryClient,
  sourceAuthorId: string,
  destinationAuthorId: string,
): void {
  invalidateAuthorDirectory(client);
  void client.invalidateQueries({
    queryKey: authorQueryKeys.detail(sourceAuthorId),
  });
  void client.invalidateQueries({
    queryKey: authorQueryKeys.detail(destinationAuthorId),
  });
  void client.invalidateQueries({ queryKey: authorQueryKeys.allRevisions });
  void client.invalidateQueries({ queryKey: bookQueryKeys.all });
  void client.invalidateQueries({ queryKey: bookQueryKeys.details });
  void client.invalidateQueries({ queryKey: bookQueryKeys.allRevisions });
}
