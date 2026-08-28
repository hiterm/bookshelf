export const authorQueryKeys = {
  all: ["authors"] as const,
  details: ["author"] as const,
  detail: (id: string) => ["author", id] as const,
  allRevisions: ["authorRevisions"] as const,
  revisions: (id: string) => ["authorRevisions", id] as const,
};
