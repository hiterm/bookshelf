import { useRef, useState } from "react";

export type BookSearchQuery = {
  isbn?: string;
  title?: string;
  authorName?: string;
  publisher?: string;
};

export type BookSearchBackend = "googleBooks" | "ndl";

export type BookSearchResult = {
  title: string;
  subtitle?: string;
  authorNames: string[];
  isbn: string;
  publisher: string;
  publishedDate?: string;
  coverImageUrl?: string;
};

export type BookSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; results: BookSearchResult[] }
  | { status: "error"; message: string };

const DC_NS = "http://purl.org/dc/elements/1.1/";

const searchGoogleBooks = async (
  query: BookSearchQuery,
): Promise<BookSearchResult[]> => {
  const parts: string[] = [];
  if (query.title) parts.push(`intitle:${query.title}`);
  if (query.authorName) parts.push(`inauthor:${query.authorName}`);
  if (query.publisher) parts.push(`inpublisher:${query.publisher}`);
  if (query.isbn) parts.push(`isbn:${query.isbn.replace(/-/g, "")}`);

  const encoded = encodeURIComponent(parts.join("+"));
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=10`,
  );
  if (!response.ok) {
    throw new Error(`Google Books API error: ${String(response.status)}`);
  }
  const data = (await response.json()) as {
    items?: {
      volumeInfo: {
        title?: string;
        subtitle?: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        industryIdentifiers?: { type: string; identifier: string }[];
        imageLinks?: { thumbnail?: string; smallThumbnail?: string };
      };
    }[];
  };
  if (!data.items) return [];

  return data.items
    .map((item) => {
      const isbn13 = item.volumeInfo.industryIdentifiers?.find(
        (id) => id.type === "ISBN_13",
      );
      return {
        title: item.volumeInfo.title ?? "",
        subtitle: item.volumeInfo.subtitle,
        authorNames: item.volumeInfo.authors ?? [],
        isbn: isbn13?.identifier ?? "",
        publisher: item.volumeInfo.publisher ?? "",
        publishedDate: item.volumeInfo.publishedDate,
        coverImageUrl: item.volumeInfo.imageLinks?.thumbnail,
      };
    })
    .filter((r) => r.title !== "");
};

const searchNdl = async (
  query: BookSearchQuery,
): Promise<BookSearchResult[]> => {
  const params = new URLSearchParams();
  if (query.title) params.set("title", query.title);
  if (query.authorName) params.set("creator", query.authorName);
  if (query.publisher) params.set("publisher", query.publisher);
  if (query.isbn) params.set("isbn", query.isbn.replace(/-/g, ""));

  const response = await fetch(`/ndl-proxy/api/opensearch?${params}`);
  if (!response.ok) {
    throw new Error(`NDL API error: ${String(response.status)}`);
  }
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = xml.querySelectorAll("item");

  return Array.from(items)
    .map((item) => {
      const title = (item.querySelector("title")?.textContent ?? "").trim();
      const authorNames = Array.from(
        item.getElementsByTagNameNS(DC_NS, "creator"),
      )
        .map((el) =>
          el.textContent
            .trim()
            .replace(/,\s*\d{4}-\d{0,4}$/, "")
            .trim(),
        )
        .filter(Boolean);
      const identifierEl = Array.from(
        item.getElementsByTagNameNS(DC_NS, "identifier"),
      ).find((el) => el.textContent.startsWith("ISBN:"));
      const isbn =
        identifierEl != null
          ? identifierEl.textContent.replace("ISBN:", "")
          : "";
      const publisherEl = Array.from(
        item.getElementsByTagNameNS(DC_NS, "publisher"),
      ).at(0);
      const publisher =
        publisherEl != null ? publisherEl.textContent.trim() : "";
      const dateEl = Array.from(item.getElementsByTagNameNS(DC_NS, "date")).at(
        0,
      );
      const publishedDate =
        dateEl != null ? dateEl.textContent.trim() : undefined;
      return { title, authorNames, isbn, publisher, publishedDate };
    })
    .filter((r) => r.title !== "");
};

export const useBookSearch = (): {
  state: BookSearchState;
  search: (query: BookSearchQuery, backend: BookSearchBackend) => Promise<void>;
} => {
  const [state, setState] = useState<BookSearchState>({ status: "idle" });
  const latestRequestIdRef = useRef(0);

  const search = async (
    query: BookSearchQuery,
    backend: BookSearchBackend,
  ): Promise<void> => {
    const isEmpty =
      !query.isbn && !query.title && !query.authorName && !query.publisher;
    if (isEmpty) {
      setState({ status: "idle" });
      return;
    }

    latestRequestIdRef.current += 1;
    const requestId = latestRequestIdRef.current;
    setState({ status: "loading" });

    try {
      const results =
        backend === "googleBooks"
          ? await searchGoogleBooks(query)
          : await searchNdl(query);
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "success", results });
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "error", message: "取得に失敗しました" });
    }
  };

  return { state, search };
};
