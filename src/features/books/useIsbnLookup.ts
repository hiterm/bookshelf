import { useState } from "react";

type IsbnLookupResult = {
  title: string;
  authorNames: string[];
};

type IsbnLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: IsbnLookupResult }
  | { status: "error"; message: string };

type OpenBdBook = {
  summary: {
    title: string;
    author: string;
  };
} | null;

type GoogleBooksResponse = {
  items?: {
    volumeInfo: {
      title: string;
      authors?: string[];
    };
  }[];
};

type UseIsbnLookupReturn = {
  state: IsbnLookupState;
  lookup: (isbn: string) => Promise<void>;
};

const parseOpenBdAuthors = (author: string): string[] =>
  author
    .split(/[／/]/)
    .map((a) => a.trim())
    .filter(Boolean);

const tryOpenBd = async (isbn: string): Promise<IsbnLookupResult | null> => {
  const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
  const data = (await response.json()) as OpenBdBook[];
  const book = data[0];
  if (book == null) return null;
  return {
    title: book.summary.title,
    authorNames: book.summary.author
      ? parseOpenBdAuthors(book.summary.author)
      : [],
  };
};

const tryGoogleBooks = async (
  isbn: string,
): Promise<IsbnLookupResult | null> => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
  );
  const data = (await response.json()) as GoogleBooksResponse;
  if (!data.items || data.items.length === 0) return null;
  const volumeInfo = data.items[0].volumeInfo;
  return {
    title: volumeInfo.title,
    authorNames: volumeInfo.authors ?? [],
  };
};

export const useIsbnLookup = (): UseIsbnLookupReturn => {
  const [state, setState] = useState<IsbnLookupState>({ status: "idle" });

  const lookup = async (isbn: string): Promise<void> => {
    const normalized = isbn.replace(/-/g, "");
    setState({ status: "loading" });
    try {
      const result =
        (await tryOpenBd(normalized)) ?? (await tryGoogleBooks(normalized));
      if (result == null) {
        setState({ status: "error", message: "書籍が見つかりませんでした" });
        return;
      }
      setState({ status: "success", result });
    } catch {
      setState({ status: "error", message: "取得に失敗しました" });
    }
  };

  return { state, lookup };
};
