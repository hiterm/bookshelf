import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useIsbnLookup } from "./useIsbnLookup";

const makeResponse = (body: unknown) =>
  Promise.resolve({
    json: () => Promise.resolve(body),
  } as Response);

const openBdFound = (title: string, author: string) =>
  makeResponse([{ summary: { title, author } }]);

const openBdNotFound = () => makeResponse([null]);

const googleBooksFound = (title: string, authors: string[]) =>
  makeResponse({ items: [{ volumeInfo: { title, authors } }] });

const googleBooksNotFound = () => makeResponse({});

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

  test("calls OpenBD URL with normalized ISBN", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValue(openBdFound("Test Book", "Author One"));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("978-4-06-536243-3");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openbd.jp/v1/get?isbn=9784065362433",
    );
  });

  test("returns title and authorNames from OpenBD on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(openBdFound("テスト書籍", "著者一／著者二")),
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

  test("parses single author without separator", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(openBdFound("テスト書籍", "著者一")),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784065362433");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.authorNames).toEqual(["著者一"]);
    }
  });

  test("returns empty authorNames when author field is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(openBdFound("タイトル", "")),
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

  test("falls back to Google Books when OpenBD returns null", async () => {
    const mockFetch = vi
      .fn()
      .mockReturnValueOnce(openBdNotFound())
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

  test("transitions to error when both APIs return not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockReturnValueOnce(openBdNotFound())
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
});
