import type { QueryClient } from "@tanstack/react-query";
import { historyQueryKeys } from "./queryKeys";

export function invalidateOperations(client: QueryClient): void {
  // New writes append operations; existing operation snapshots are immutable.
  void client.invalidateQueries({ queryKey: historyQueryKeys.all });
}
