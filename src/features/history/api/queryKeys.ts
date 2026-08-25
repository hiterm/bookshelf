export const historyQueryKeys = {
  all: ["eventSets"] as const,
  detail: (id: string) => ["eventSet", id] as const,
};
