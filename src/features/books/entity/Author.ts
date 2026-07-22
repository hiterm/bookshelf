import { z } from "zod";

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  yomi: z.string(),
});

export type Author = z.infer<typeof authorSchema>;
