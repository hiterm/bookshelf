import type { ImportedBook } from "./parseKindleExport";

const localDateStart = (date: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match == null) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const result = new Date(year, month - 1, day);
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }
  return result;
};

export const filterImportedBooks = (
  books: readonly ImportedBook[],
  purchasedOnOrAfter?: string,
): ImportedBook[] => {
  if (purchasedOnOrAfter == null || purchasedOnOrAfter === "") {
    return [...books];
  }

  const threshold = localDateStart(purchasedOnOrAfter);
  if (threshold == null) return [];

  return books.filter(
    (book) => book.purchasedAt.getTime() >= threshold.getTime(),
  );
};
