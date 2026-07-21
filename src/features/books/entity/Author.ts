import { z } from "zod";

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  yomi: z.string().optional(),
});

export type Author = z.infer<typeof authorSchema>;
