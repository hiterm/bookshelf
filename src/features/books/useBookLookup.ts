import { useRef, useState } from "react";
import { z } from "zod";

export type BookLookupQuery = {
  isbn?: string;
  title?: string;
  authorName?: string;
  publisher?: string;
};

export type BookLookupBackend = "googleBooks" | "ndl";

export type BookLookupResult = {
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

export type BookLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; results: BookLookupResult[] }
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

const openBdEnrichEntrySchema = z.union([
  z.object({
    summary: z
      .object({
        isbn: z.string().optional(),
        cover: z.string().optional(),
        title: z.string().optional(),
        series: z.string().optional(),
        volume: z.string().optional(),
      })
      .optional(),
    onix: z
      .object({
        DescriptiveDetail: z
          .object({ ProductFormDetail: z.string().optional() })
          .optional(),
      })
      .optional(),
  }),
  z.null(),
]);

const openBdResponseSchema = z.array(openBdEnrichEntrySchema);

type OpenBdEnrichEntry = z.infer<typeof openBdEnrichEntrySchema>;

const enrichWithOpenBd = async (
  results: BookLookupResult[],
): Promise<BookLookupResult[]> => {
  const isbns = results.map((r) => r.isbn).filter(Boolean);
  if (isbns.length === 0) return results;
  const uniqueIsbns = Array.from(new Set(isbns));

  let data: z.infer<typeof openBdResponseSchema>;
  try {
    const response = await fetch(
      `/openbd-proxy/v1/get?isbn=${uniqueIsbns.join(",")}`,
    );
    if (!response.ok) {
      console.warn(
        `OpenBD enrichment failed: status=${String(response.status)}`,
        { isbns: uniqueIsbns },
      );
      return results;
    }
    const rawData: unknown = await response.json();
    data = openBdResponseSchema.parse(rawData);
  } catch (err) {
    console.warn("OpenBD enrichment error:", err, { isbns: uniqueIsbns });
    return results;
  }

  const byRequestIsbn = new Map<string, OpenBdEnrichEntry>();
  for (let i = 0; i < uniqueIsbns.length; i++) {
    const entry = data[i];
    if (entry) byRequestIsbn.set(uniqueIsbns[i], entry);
  }

  return results.map((r) => {
    const entry = byRequestIsbn.get(r.isbn);
    if (!entry) return r;
    const isbn13 = entry.summary?.isbn;
    const cover = entry.summary?.cover;
    const rawTitle = entry.summary?.title;
    const rawSeries = entry.summary?.series;
    const rawVolume = entry.summary?.volume;
    const productFormDetail =
      entry.onix?.DescriptiveDetail?.ProductFormDetail ?? "";
    return {
      ...r,
      isbn: isbn13 ?? r.isbn,
      title: rawTitle != null && rawTitle !== "" ? rawTitle : r.title,
      coverImageUrl: r.coverImageUrl ?? (cover !== "" ? cover : undefined),
      openBdFormat: PRODUCT_FORM_DETAIL_LABELS[productFormDetail],
      series: rawSeries !== "" ? rawSeries : undefined,
      volume: rawVolume !== "" ? rawVolume : undefined,
    };
  });
};

const googleBooksResponseSchema = z.object({
  items: z
    .array(
      z.object({
        volumeInfo: z.object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          authors: z.array(z.string()).optional(),
          publisher: z.string().optional(),
          publishedDate: z.string().optional(),
          industryIdentifiers: z
            .array(z.object({ type: z.string(), identifier: z.string() }))
            .optional(),
          imageLinks: z
            .object({
              thumbnail: z.string().optional(),
              smallThumbnail: z.string().optional(),
            })
            .optional(),
        }),
      }),
    )
    .optional(),
});

const DC_NS = "http://purl.org/dc/elements/1.1/";
const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

const searchGoogleBooks = async (
  query: BookLookupQuery,
): Promise<BookLookupResult[]> => {
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
  const rawData: unknown = await response.json();
  const data = googleBooksResponseSchema.parse(rawData);
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
  query: BookLookupQuery,
): Promise<BookLookupResult[]> => {
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
      const identifierEls = Array.from(
        item.getElementsByTagNameNS(DC_NS, "identifier"),
      ).filter((el) => el.getAttributeNS(XSI_NS, "type") === "dcndl:ISBN");
      const identifierEl =
        identifierEls.find(
          (el) => el.textContent.trim().replace(/-/g, "").length === 13,
        ) ?? identifierEls.at(0);
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

export const useBookLookup = (): {
  state: BookLookupState;
  search: (query: BookLookupQuery, backend: BookLookupBackend) => Promise<void>;
} => {
  const [state, setState] = useState<BookLookupState>({ status: "idle" });
  const latestRequestIdRef = useRef(0);

  const search = async (
    query: BookLookupQuery,
    backend: BookLookupBackend,
  ): Promise<void> => {
    const isEmpty =
      !query.isbn && !query.title && !query.authorName && !query.publisher;
    if (isEmpty) {
      latestRequestIdRef.current += 1;
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
        // enrichment errors are already logged and handled inside enrichWithOpenBd
        // eslint-disable-next-line no-empty
      } catch {}
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "success", results: enriched });
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      setState({ status: "error", message: "取得に失敗しました" });
    }
  };

  return { state, search };
};
