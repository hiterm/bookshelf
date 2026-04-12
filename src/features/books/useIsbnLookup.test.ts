import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useIsbnLookup } from "./useIsbnLookup";

const DC_NS = "http://purl.org/dc/elements/1.1/";

const makeTextResponse = (text: string, ok = true) =>
  Promise.resolve({
    ok,
    text: () => Promise.resolve(text),
  } as Response);

const makeJsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);

const ndlXml = (title: string, creators: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="${DC_NS}">
  <channel>
    <item>
      <title>${title}</title>
      ${creators.map((c) => `<dc:creator>${c}</dc:creator>`).join("")}
    </item>
  </channel>
</rss>`;

const ndlEmptyXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="${DC_NS}">
  <channel></channel>
</rss>`;

const googleBooksFound = (title: string, authors: string[]) =>
  makeJsonResponse({ items: [{ volumeInfo: { title, authors } }] });

const googleBooksNotFound = () => makeJsonResponse({});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsbnLookup", () => {
  test("initial state is idle", () => {
    const { result } = renderHook(() => useIsbnLookup());
    expect(result.current.state.status).toBe("idle");
  });

  test("calls NDL URL with normalized ISBN", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(makeTextResponse(ndlXml("テスト書籍", ["著者一"])));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("978-4-06-536243-3");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ndlsearch.ndl.go.jp/api/opensearch?isbn=9784065362433",
    );
  });

  test("returns title and authorNames from NDL on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValue(
          makeTextResponse(ndlXml("テスト書籍", ["著者一", "著者二"])),
        ),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784065362433");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.title).toBe("テスト書籍");
      expect(result.current.state.result.authorNames).toEqual([
        "著者一",
        "著者二",
      ]);
    }
  });

  test("returns empty authorNames when no dc:creator elements", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(makeTextResponse(ndlXml("タイトルのみ", []))),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784065362433");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.authorNames).toEqual([]);
    }
  });

  test("falls back to Google Books when NDL returns no items", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(makeTextResponse(ndlEmptyXml()))
      .mockReturnValueOnce(googleBooksFound("English Book", ["John Doe"]));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9780000000001");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.title).toBe("English Book");
      expect(result.current.state.result.authorNames).toEqual(["John Doe"]);
    }
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://www.googleapis.com/books/v1/volumes?q=isbn:9780000000001",
    );
  });

  test("transitions to error on HTTP error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(makeTextResponse("", false)),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784065362433");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
  });

  test("transitions to error when both APIs return not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValueOnce(makeTextResponse(ndlEmptyXml()))
        .mockReturnValueOnce(googleBooksNotFound()),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784000000001");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
  });

  test("transitions to error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(Promise.reject(new Error("network error"))),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784065362433");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
  });

  test("discards stale response when a newer lookup is in flight", async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>(
      (resolve) => (resolveFirst = resolve),
    );

    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(firstResponse)
      .mockReturnValueOnce(makeTextResponse(ndlXml("新しい書籍", ["著者B"])));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useIsbnLookup());

    act(() => {
      void result.current.lookup("9784000000001");
    });

    await act(async () => {
      await result.current.lookup("9784000000002");
    });

    resolveFirst(await makeTextResponse(ndlXml("古い書籍", ["著者A"])));

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    if (result.current.state.status === "success") {
      expect(result.current.state.result.title).toBe("新しい書籍");
    }
  });
});
