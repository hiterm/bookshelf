import { useCallback, useRef, useState } from "react";

export type OpenBdDetail = {
  coverImageUrl?: string;
  description?: string;
  tableOfContents?: string;
  format?: string;
  pageCount?: number;
  publishedDate?: string;
  series?: string;
  volume?: string;
  genre?: string;
};

export type OpenBdState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; detail: OpenBdDetail; rawData: unknown }
  | { status: "error"; message: string };

type OpenBdSummary = {
  isbn?: string;
  title?: string;
  author?: string;
  publisher?: string;
  pubdate?: string;
  cover?: string;
  series?: string;
  volume?: string;
};

type OpenBdTextContent = {
  TextType?: string;
  Text?: string;
};

type OpenBdExtent = {
  ExtentType?: string;
  ExtentValue?: string;
};

type OpenBdOnix = {
  DescriptiveDetail?: {
    Extent?: OpenBdExtent[];
    ProductFormDetail?: string;
  };
  CollateralDetail?: {
    TextContent?: OpenBdTextContent[];
  };
};

type OpenBdHanmoto = {
  genrename?: string;
};

type OpenBdEntry = {
  summary?: OpenBdSummary;
  onix?: OpenBdOnix;
  hanmoto?: OpenBdHanmoto;
} | null;

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

const findTextContent = (
  textContents: OpenBdTextContent[],
  ...types: string[]
): string | undefined => {
  for (const type of types) {
    const entry = textContents.find((t) => t.TextType === type);
    if (entry?.Text) return entry.Text;
  }
  return undefined;
};

const parseOpenBdEntry = (entry: OpenBdEntry): OpenBdDetail => {
  if (entry == null) return {};

  const cover = entry.summary?.cover;
  const coverImageUrl = cover !== "" ? cover : undefined;
  const pubdate = entry.summary?.pubdate;
  const publishedDate = pubdate !== "" ? pubdate : undefined;
  const rawSeries = entry.summary?.series;
  const series = rawSeries !== "" ? rawSeries : undefined;
  const rawVolume = entry.summary?.volume;
  const volume = rawVolume !== "" ? rawVolume : undefined;
  const genre = entry.hanmoto?.genrename ?? undefined;

  const textContents = entry.onix?.CollateralDetail?.TextContent ?? [];
  const description = findTextContent(textContents, "03", "02");
  const tableOfContents = findTextContent(textContents, "04");

  const extents = entry.onix?.DescriptiveDetail?.Extent ?? [];
  const pageExtent = extents.find((e) => e.ExtentType === "11");
  const pageCount =
    pageExtent?.ExtentValue != null
      ? Number(pageExtent.ExtentValue)
      : undefined;

  const productFormDetail =
    entry.onix?.DescriptiveDetail?.ProductFormDetail ?? "";
  const format = PRODUCT_FORM_DETAIL_LABELS[productFormDetail] ?? undefined;

  return {
    coverImageUrl,
    description,
    tableOfContents,
    format,
    pageCount,
    publishedDate,
    series,
    volume,
    genre,
  };
};

export const useOpenBdDetail = (): {
  state: OpenBdState;
  fetch: (isbn: string) => Promise<void>;
  reset: () => void;
} => {
  const [state, setState] = useState<OpenBdState>({ status: "idle" });
  const requestIdRef = useRef(0);

  const fetch = useCallback(async (isbn: string): Promise<void> => {
    requestIdRef.current += 1;
    const currentRequest = requestIdRef.current;
    setState({ status: "loading" });
    const url = `/openbd-proxy/v1/get?isbn=${encodeURIComponent(isbn)}`;
    try {
      const response = await window.fetch(url);
      if (!response.ok) {
        console.debug(
          `[DEBUG] url=${url} status=${String(response.status)}`,
          await response.text().catch(() => "(body unreadable)"),
        );
        if (currentRequest !== requestIdRef.current) return;
        setState({
          status: "error",
          message: "詳細情報を取得できませんでした",
        });
        return;
      }
      const text = await response.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        console.debug(
          `[DEBUG] url=${url} JSON parse error: ${String(parseErr)} body=${text.slice(0, 300)}`,
        );
        if (currentRequest !== requestIdRef.current) return;
        setState({
          status: "error",
          message: "詳細情報を取得できませんでした",
        });
        return;
      }
      if (
        !Array.isArray(parsed) ||
        !parsed.every((e) => e === null || typeof e === "object")
      ) {
        console.debug(`[DEBUG] url=${url} unexpected response shape`, parsed);
        if (currentRequest !== requestIdRef.current) return;
        setState({
          status: "error",
          message: "詳細情報を取得できませんでした",
        });
        return;
      }
      const data = parsed as OpenBdEntry[];
      const entry = data[0] ?? null;
      const detail = parseOpenBdEntry(entry);
      if (currentRequest !== requestIdRef.current) return;
      setState({ status: "success", detail, rawData: data });
    } catch (err) {
      console.debug(`[DEBUG] url=${url} fetch error: ${String(err)}`);
      if (currentRequest !== requestIdRef.current) return;
      setState({ status: "error", message: "詳細情報を取得できませんでした" });
    }
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, fetch, reset };
};
