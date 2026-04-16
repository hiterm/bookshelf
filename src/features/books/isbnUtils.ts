export const normalizeIsbn = (isbn: string): string => isbn.replace(/-/g, "");
export const isValidIsbn13 = (isbn: string): boolean =>
  /^\d{13}$/.test(normalizeIsbn(isbn));
