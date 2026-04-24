import { z } from "zod";

export const authorFormSchema = z.object({
  name: z.string().min(1),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;
