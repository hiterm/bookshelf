import { useRef, useState } from "react";

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
  lookup: (isbn: string) => Promise<IsbnLookupResult | null>;
};

const tryNdl = async (isbn: string): Promise<IsbnLookupResult | null> => {
  const response = await fetch(`/ndl-proxy/api/opensearch?isbn=${isbn}`);
  if (!response.ok) {
    throw new Error(`NDL API error: ${String(response.status)}`);
  }
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
  if (!response.ok) {
    throw new Error(`Google Books API error: ${String(response.status)}`);
  }
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
  const latestRequestIdRef = useRef(0);

  const lookup = async (isbn: string): Promise<IsbnLookupResult | null> => {
    const normalized = isbn.replace(/-/g, "");
    latestRequestIdRef.current += 1;
    const requestId = latestRequestIdRef.current;
    setState({ status: "loading" });
    try {
      const result =
        (await tryNdl(normalized)) ?? (await tryGoogleBooks(normalized));
      if (requestId !== latestRequestIdRef.current) return null;
      if (result == null) {
        setState({ status: "error", message: "書籍が見つかりませんでした" });
        return null;
      }
      setState({ status: "success", result });
      return result;
    } catch {
      if (requestId !== latestRequestIdRef.current) return null;
      setState({ status: "error", message: "取得に失敗しました" });
      return null;
    }
  };

  return { state, lookup };
};
