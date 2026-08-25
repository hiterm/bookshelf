export const bookQueryKeys = {
  all: ["books"] as const,
  details: ["book"] as const,
  detail: (id: string) => ["book", id] as const,
  allEvents: ["bookEvents"] as const,
  events: (id: string) => ["bookEvents", id] as const,
};
