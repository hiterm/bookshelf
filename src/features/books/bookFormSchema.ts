import { z } from "zod";
import { BOOK_FORMAT_VALUE } from "./entity/BookFormat";
import { BOOK_STORE_VALUE } from "./entity/BookStore";

export const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).min(1),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(BOOK_FORMAT_VALUE),
  store: z.enum(BOOK_STORE_VALUE),
  owned: z.boolean().default(false),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
