import { useCallback, useState } from "react";

export type OpenBdDetail = {
  coverImageUrl?: string;
  description?: string;
  format?: string;
  pageCount?: number;
  publishedDate?: string;
};

export type OpenBdState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; detail: OpenBdDetail }
  | { status: "error"; debugInfo: string };

type OpenBdSummary = {
  isbn?: string;
  title?: string;
  author?: string;
  publisher?: string;
  pubdate?: string;
  cover?: string;
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

type OpenBdEntry = {
  summary?: OpenBdSummary;
  onix?: OpenBdOnix;
} | null;

const PRODUCT_FORM_DETAIL_LABELS: Record<string, string> = {
  B401: "文庫判",
  B402: "新書判",
  B403: "四六判",
  B404: "A5判",
  B405: "B5判",
  B406: "A4判",
  B407: "B6判",
};

const parseOpenBdEntry = (entry: OpenBdEntry): OpenBdDetail => {
  if (entry == null) return {};

  const coverImageUrl = entry.summary?.cover ?? undefined;
  const publishedDate = entry.summary?.pubdate ?? undefined;

  const textContents = entry.onix?.CollateralDetail?.TextContent ?? [];
  const descriptionEntry = textContents.find((t) => t.TextType === "03");
  const description = descriptionEntry?.Text ?? undefined;

  const extents = entry.onix?.DescriptiveDetail?.Extent ?? [];
  const pageExtent = extents.find((e) => e.ExtentType === "11");
  const pageCount =
    pageExtent?.ExtentValue != null
      ? Number(pageExtent.ExtentValue)
      : undefined;

  const productFormDetail =
    entry.onix?.DescriptiveDetail?.ProductFormDetail ?? "";
  const format = PRODUCT_FORM_DETAIL_LABELS[productFormDetail] ?? undefined;

  return { coverImageUrl, description, format, pageCount, publishedDate };
};

export const useOpenBdDetail = (): {
  state: OpenBdState;
  fetch: (isbn: string) => Promise<void>;
  reset: () => void;
} => {
  const [state, setState] = useState<OpenBdState>({ status: "idle" });

  const fetch = useCallback(async (isbn: string): Promise<void> => {
    setState({ status: "loading" });
    const url = `/openbd-proxy/v1/get?isbn=${encodeURIComponent(isbn)}`;
    try {
      const response = await window.fetch(url);
      if (!response.ok) {
        const body = await response.text().catch(() => "(body unreadable)");
        setState({
          status: "error",
          debugInfo: `[DEBUG] url=${url} status=${String(response.status)} body=${body.slice(0, 300)}`,
        });
        return;
      }
      const text = await response.text();
      let data: OpenBdEntry[];
      try {
        data = JSON.parse(text) as OpenBdEntry[];
      } catch (parseErr) {
        setState({
          status: "error",
          debugInfo: `[DEBUG] url=${url} JSON parse error: ${String(parseErr)} body=${text.slice(0, 300)}`,
        });
        return;
      }
      const entry = data[0] ?? null;
      const detail = parseOpenBdEntry(entry);
      setState({ status: "success", detail });
    } catch (err) {
      setState({
        status: "error",
        debugInfo: `[DEBUG] url=${url} fetch error: ${String(err)}`,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, fetch, reset };
};
