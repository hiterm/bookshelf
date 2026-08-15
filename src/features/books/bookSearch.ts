import { z } from "zod";
import { BOOK_FORMAT_VALUE } from "./entity/BookFormat";
import { BOOK_STORE_VALUE } from "./entity/BookStore";

const columnFilterSchema = z.discriminatedUnion("id", [
  z.object({ id: z.literal("title"), value: z.string() }),
  z.object({ id: z.literal("authors"), value: z.array(z.string()) }),
  z.object({ id: z.literal("authorYomis"), value: z.string() }),
  z.object({ id: z.literal("isbn"), value: z.string() }),
  z.object({ id: z.literal("format"), value: z.enum(BOOK_FORMAT_VALUE) }),
  z.object({ id: z.literal("store"), value: z.enum(BOOK_STORE_VALUE) }),
  z.object({ id: z.literal("read"), value: z.boolean() }),
  z.object({ id: z.literal("owned"), value: z.boolean() }),
]);

export const bookColumnFiltersSchema = z.array(columnFilterSchema);

const sortingItemSchema = z.object({
  id: z.enum([
    "title",
    "authors",
    "authorYomis",
    "isbn",
    "format",
    "store",
    "priority",
    "read",
    "owned",
    "createdAt",
    "updatedAt",
  ]),
  desc: z.boolean(),
});

export const bookSortingSchema = z.array(sortingItemSchema);

export const bookSearchSchema = z.object({
  columnFilters: bookColumnFiltersSchema.optional(),
  sorting: bookSortingSchema.optional(),
  pageIndex: z.number().int().nonnegative().optional(),
  pageSize: z.union([z.literal(20), z.literal(50), z.literal(100)]).optional(),
});
