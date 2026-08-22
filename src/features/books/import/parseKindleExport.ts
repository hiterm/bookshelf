import { kindleExportSchema } from "./kindleExportSchema";

export type ImportedBook = {
  title: string;
  authorNames: string[];
  purchasedAt: Date;
  read: boolean;
  asin: string;
  imageUrl?: string;
};

export class KindleExportParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "KindleExportParseError";
  }
}

export const parseKindleExport = (text: string): ImportedBook[] => {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch (error) {
    throw new KindleExportParseError("JSONファイルの形式が正しくありません", {
      cause: error,
    });
  }

  const result = kindleExportSchema.safeParse(value);
  if (!result.success) {
    throw new KindleExportParseError(
      `Kindle Bookshelf Exporterのデータ形式ではありません: ${result.error.issues[0]?.message ?? "invalid data"}`,
      { cause: result.error },
    );
  }

  return result.data.map((book) => {
    const purchasedAt = new Date(book.acquiredTime);
    if (Number.isNaN(purchasedAt.getTime())) {
      throw new KindleExportParseError(
        `購入日が正しくありません: ${book.title}`,
      );
    }

    return {
      title: book.title,
      authorNames: [book.authors],
      purchasedAt,
      read: book.readStatus === "READ",
      asin: book.asin,
      ...(book.productImage == null ? {} : { imageUrl: book.productImage }),
    };
  });
};
