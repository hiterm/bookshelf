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
  openBdFormat?: string;
  series?: string;
  volume?: string;
};

export type BookSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; results: BookSearchResult[] }
  | { status: "error"; message: string };

const PRODUCT_FORM_DETAIL_LABELS: Record<string, string> = {
  B401: "文庫判",
  B402: "新書判",
  B403: "四六判",
  B404: "A5判",
  B405: "B5判",
  B406: "A4判",
  B407: "B6判",
  B408: "菊判",
  B409: "AB判",
  B410: "B4判",
  B501: "ポケット判",
  B502: "変形判",
};

type OpenBdEnrichEntry = {
  summary?: {
    isbn?: string;
    cover?: string;
    series?: string;
    volume?: string;
  };
  onix?: {
    DescriptiveDetail?: { ProductFormDetail?: string };
  };
} | null;

const enrichWithOpenBd = async (
  results: BookSearchResult[],
): Promise<BookSearchResult[]> => {
  const isbns = results.map((r) => r.isbn).filter(Boolean);
  if (isbns.length === 0) return results;

  const response = await fetch(`/openbd-proxy/v1/get?isbn=${isbns.join(",")}`);
  if (!response.ok) return results;

  const data = (await response.json()) as OpenBdEnrichEntry[];
  const byIsbn = new Map<string, OpenBdEnrichEntry>();
  for (const entry of data) {
    if (entry?.summary?.isbn) byIsbn.set(entry.summary.isbn, entry);
  }

  return results.map((r) => {
    const entry = byIsbn.get(r.isbn);
    if (!entry) return r;
    const cover = entry.summary?.cover;
    const rawSeries = entry.summary?.series;
    const rawVolume = entry.summary?.volume;
    const productFormDetail =
      entry.onix?.DescriptiveDetail?.ProductFormDetail ?? "";
    return {
      ...r,
      coverImageUrl: r.coverImageUrl ?? (cover !== "" ? cover : undefined),
      openBdFormat: PRODUCT_FORM_DETAIL_LABELS[productFormDetail],
      series: rawSeries !== "" ? rawSeries : undefined,
      volume: rawVolume !== "" ? rawVolume : undefined,
    };
  });
};

const DC_NS = "http://purl.org/dc/elements/1.1/";
const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

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
  params.set("mediaType", "1");
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
      ).find((el) => el.getAttributeNS(XSI_NS, "type") === "dcndl:ISBN");
      const isbn =
        identifierEl != null
          ? identifierEl.textContent.trim().replace(/-/g, "")
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
      const categories = Array.from(item.querySelectorAll("category")).map(
        (el) => el.textContent.trim(),
      );
      return { title, authorNames, isbn, publisher, publishedDate, categories };
    })
    .filter((r) => r.title !== "" && r.categories.includes("図書"))
    .map(({ categories: _categories, ...rest }) => rest);
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
      let enriched = results;
      try {
        enriched = await enrichWithOpenBd(results);
      } catch {
        // silently use unenriched results
      }
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "success", results: enriched });
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "error", message: "取得に失敗しました" });
    }
  };

  return { state, search };
};
