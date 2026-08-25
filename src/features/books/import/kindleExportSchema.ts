import { z } from "zod";

export const kindleExportBookSchema = z.looseObject({
  title: z.string().min(1),
  authors: z
    .string()
    .refine((authors) =>
      authors.split(",").some((author) => author.trim() !== ""),
    ),
  acquiredTime: z.number().int().nonnegative(),
  readStatus: z.enum(["READ", "UNKNOWN"]),
  asin: z.string().min(1),
  productImage: z.url().nullish(),
});

export const kindleExportSchema = z.array(kindleExportBookSchema);

export type KindleExportBook = z.infer<typeof kindleExportBookSchema>;
