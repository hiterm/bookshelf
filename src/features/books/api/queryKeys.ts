export const bookQueryKeys = {
  all: ["books"] as const,
  details: ["book"] as const,
  detail: (id: string) => ["book", id] as const,
  allRevisions: ["bookRevisions"] as const,
  revisions: (id: string) => ["bookRevisions", id] as const,
};
