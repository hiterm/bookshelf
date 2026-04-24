import { z } from "zod";

export const authorFormSchema = z.object({
  name: z.string().trim().min(1, { error: "Please enter a valid name" }),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;
