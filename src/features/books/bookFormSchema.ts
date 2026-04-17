import { z } from "zod";
import { BookFormat, BookStore } from "../../generated/graphql-request";
import { Author } from "./entity/Author";

export type BookFormValues = {
  title: string;
  authors: Author[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: BookFormat;
  store: BookStore;
};

export const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).nonempty(),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(["E_BOOK", "PRINTED", "UNKNOWN"]),
  store: z.enum(["KINDLE", "UNKNOWN"]),
  owned: z.boolean().default(false),
});
