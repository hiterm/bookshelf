import { z } from "zod";

export const authorFormSchema = z.object({
  name: z.string().trim().min(1, { error: "Please enter a valid name" }),
  yomi: z.string().trim().min(1, { error: "読み仮名を入力してください" }),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;
