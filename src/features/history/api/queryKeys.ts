export const historyQueryKeys = {
  all: ["operations"] as const,
  detail: (id: string) => ["operation", id] as const,
};
