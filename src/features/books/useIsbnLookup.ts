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

export const useIsbnLookup = (): UseIsbnLookupReturn => {
  const [state, setState] = useState<IsbnLookupState>({ status: "idle" });

  const lookup = async (isbn: string): Promise<void> => {
    const normalized = isbn.replace(/-/g, "");
    setState({ status: "loading" });
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${normalized}`,
      );
      const data = (await response.json()) as GoogleBooksResponse;
      if (!data.items || data.items.length === 0) {
        setState({ status: "error", message: "書籍が見つかりませんでした" });
        return;
      }
      const volumeInfo = data.items[0].volumeInfo;
      setState({
        status: "success",
        result: {
          title: volumeInfo.title,
          authorNames: volumeInfo.authors ?? [],
        },
      });
    } catch {
      setState({ status: "error", message: "取得に失敗しました" });
    }
  };

  return { state, lookup };
};
