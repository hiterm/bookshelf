import { z } from "zod";

const columnFilterSchema = z.object({
  id: z.string(),
  value: z.unknown(),
});

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const bookSearchSchema = z.object({
  columnFilters: z.array(columnFilterSchema).optional(),
  sorting: z.array(sortingItemSchema).optional(),
  pageIndex: z.number().int().nonnegative().optional(),
  pageSize: z.union([z.literal(20), z.literal(50), z.literal(100)]).optional(),
});
