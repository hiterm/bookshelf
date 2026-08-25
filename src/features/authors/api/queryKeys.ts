export const authorQueryKeys = {
  all: ["authors"] as const,
  details: ["author"] as const,
  detail: (id: string) => ["author", id] as const,
  allEvents: ["authorEvents"] as const,
  events: (id: string) => ["authorEvents", id] as const,
};
