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

const tryNdl = async (isbn: string): Promise<IsbnLookupResult | null> => {
  const response = await fetch(
    `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn}`,
  );
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = xml.querySelectorAll("item");
  if (items.length === 0) return null;
  const item = items[0];
  const title = item.querySelector("title")?.textContent ?? "";
  if (!title) return null;
  const creatorElements = item.getElementsByTagNameNS(
    "http://purl.org/dc/elements/1.1/",
    "creator",
  );
  const authorNames = Array.from(creatorElements)
    .map((el) => el.textContent)
    .filter(Boolean);
  return { title, authorNames };
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
        (await tryNdl(normalized)) ?? (await tryGoogleBooks(normalized));
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
