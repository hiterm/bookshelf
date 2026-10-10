import type { QueryClient } from "@tanstack/react-query";
import { authorQueryKeys } from "../../authors/api/queryKeys";
import { invalidateOperations } from "../../history/api/invalidation";
import { bookQueryKeys } from "./queryKeys";

function invalidateBookSave(client: QueryClient): void {
  // Atomic saves can also create authors and change authored-book lists.
  void client.invalidateQueries({ queryKey: authorQueryKeys.all });
  void client.invalidateQueries({ queryKey: authorQueryKeys.details });
  void client.invalidateQueries({ queryKey: bookQueryKeys.all });
  invalidateOperations(client);
}

export function invalidateBookCreate(client: QueryClient): void {
  invalidateBookSave(client);
}

export function invalidateBookUpdate(
  client: QueryClient,
  bookId: string,
): void {
  invalidateBookSave(client);
  void client.invalidateQueries({ queryKey: bookQueryKeys.detail(bookId) });
  void client.invalidateQueries({ queryKey: bookQueryKeys.revisions(bookId) });
}

export function invalidateBookDelete(
  client: QueryClient,
  bookId: string,
): void {
  void client.invalidateQueries({ queryKey: bookQueryKeys.all });
  void client.invalidateQueries({ queryKey: bookQueryKeys.detail(bookId) });
  // The response has no previous author IDs; refresh the authored-book family.
  void client.invalidateQueries({ queryKey: authorQueryKeys.details });
  invalidateOperations(client);
}

export function invalidateBookImport(client: QueryClient): void {
  // Import creates books and may create authors; existing books are unchanged.
  invalidateBookSave(client);
}
