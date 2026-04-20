import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useBookLookup } from "./useBookLookup";

const DC_NS = "http://purl.org/dc/elements/1.1/";
const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

const makeTextResponse = (text: string, ok = true) =>
  Promise.resolve(new Response(text, { status: ok ? 200 : 500 }));

const makeJsonResponse = (body: unknown, ok = true) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status: ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    }),
  );

const ndlXml = (title: string, creators: string[], isbn = "", publisher = "") =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="${DC_NS}" xmlns:xsi="${XSI_NS}">
  <channel>
    <item>
      <title>${title}</title>
      <category>図書</category>
      ${creators.map((c) => `<dc:creator>${c}</dc:creator>`).join("")}
      ${isbn ? `<dc:identifier xsi:type="dcndl:ISBN">${isbn}</dc:identifier>` : ""}
      ${publisher ? `<dc:publisher>${publisher}</dc:publisher>` : ""}
    </item>
  </channel>
</rss>`;

const googleBooksResponse = (
  title: string,
  authors: string[],
  isbn = "9784065362433",
  publisher = "出版社",
) =>
  makeJsonResponse({
    items: [
      {
        volumeInfo: {
          title,
          authors,
          publisher,
          industryIdentifiers: [{ type: "ISBN_13", identifier: isbn }],
        },
      },
    ],
  });

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useBookLookup", () => {
  test("initial state is idle", () => {
    const { result } = renderHook(() => useBookLookup());
    expect(result.current.state.status).toBe("idle");
  });

  test("all-empty query sets state back to idle without fetching", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({}, "googleBooks");
    });

    expect(result.current.state.status).toBe("idle");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("Google Books search with title builds intitle: query and returns results", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(googleBooksResponse("Rustプログラミング", ["著者A"]));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "Rust" }, "googleBooks");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("intitle%3ARust"),
    );
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].title).toBe("Rustプログラミング");
      expect(result.current.state.results[0].authorNames).toEqual(["著者A"]);
    }
  });

  test("Google Books search with ISBN strips hyphens and builds isbn: query", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(googleBooksResponse("Some Book", ["Author"]));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ isbn: "978-4-06-536243-3" }, "googleBooks");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("isbn%3A9784065362433"),
    );
  });

  test("Google Books returning no items yields success with empty results", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(makeJsonResponse({})));

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "unknown" }, "googleBooks");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results).toEqual([]);
    }
  });

  test("NDL search with title sends title param and parses XML correctly", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(
        makeTextResponse(
          ndlXml("プログラミングRust", ["Jim Blandy"], "9784065362433"),
        ),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "プログラミング" }, "ndl");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "title=%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0",
      ),
    );
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].title).toBe("プログラミングRust");
      expect(result.current.state.results[0].isbn).toBe("9784065362433");
    }
  });

  test("NDL search with ISBN strips hyphens", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(makeTextResponse(ndlXml("テスト", [])));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ isbn: "978-4-06-536243-3" }, "ndl");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("isbn=9784065362433"),
    );
  });

  test("HTTP error yields error state with message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(makeJsonResponse({}, false)),
    );

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "test" }, "googleBooks");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    if (result.current.state.status === "error") {
      expect(result.current.state.message).toBe("取得に失敗しました");
    }
  });

  test("network failure yields error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(Promise.reject(new Error("network error"))),
    );

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "test" }, "googleBooks");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    if (result.current.state.status === "error") {
      expect(result.current.state.message).toBe("取得に失敗しました");
    }
  });

  test("OpenBD enrichment fills coverImageUrl for NDL results without cover", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(
        makeTextResponse(
          ndlXml("テスト本", ["著者A"], "9784065362433", "出版社"),
        ),
      )
      .mockReturnValueOnce(
        makeJsonResponse([
          {
            summary: {
              isbn: "9784065362433",
              cover: "https://cover.example.com/img.jpg",
              series: "",
              volume: "",
            },
            onix: { DescriptiveDetail: { ProductFormDetail: "B401" } },
          },
        ]),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "テスト" }, "ndl");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].coverImageUrl).toBe(
        "https://cover.example.com/img.jpg",
      );
      expect(result.current.state.results[0].openBdFormat).toBe("文庫判");
    }
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/openbd-proxy/v1/get?isbn=9784065362433"),
    );
  });

  test("OpenBD enrichment fills series and volume when present", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(
        makeTextResponse(
          ndlXml("テスト本", ["著者A"], "9784065362433", "出版社"),
        ),
      )
      .mockReturnValueOnce(
        makeJsonResponse([
          {
            summary: {
              isbn: "9784065362433",
              cover: "",
              series: "テストシリーズ",
              volume: "3",
            },
            onix: { DescriptiveDetail: { ProductFormDetail: "" } },
          },
        ]),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "テスト" }, "ndl");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].series).toBe("テストシリーズ");
      expect(result.current.state.results[0].volume).toBe("3");
    }
  });

  test("OpenBD HTTP error does not fail search — returns unenriched results", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(
        makeTextResponse(
          ndlXml("テスト本", ["著者A"], "9784065362433", "出版社"),
        ),
      )
      .mockReturnValueOnce(makeJsonResponse({}, false));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "テスト" }, "ndl");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].title).toBe("テスト本");
      expect(result.current.state.results[0].coverImageUrl).toBeUndefined();
    }
  });

  test("OpenBD not called when all results have no ISBN", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(
        makeTextResponse(ndlXml("ISBNなし本", ["著者A"], "", "出版社")),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    await act(async () => {
      await result.current.search({ title: "テスト" }, "ndl");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("stale response is discarded when a newer search completes first", async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>(
      (resolve) => (resolveFirst = resolve),
    );

    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(firstResponse)
      .mockReturnValueOnce(
        googleBooksResponse("新しい書籍", ["著者B"], "9784000000002"),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useBookLookup());

    act(() => {
      void result.current.search({ title: "first" }, "googleBooks");
    });

    await act(async () => {
      await result.current.search({ title: "second" }, "googleBooks");
    });

    resolveFirst(
      await googleBooksResponse("古い書籍", ["著者A"], "9784000000001"),
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    if (result.current.state.status === "success") {
      expect(result.current.state.results[0].title).toBe("新しい書籍");
    }
  });
});
