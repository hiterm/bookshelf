import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useIsbnLookup } from "./useIsbnLookup";

const makeResponse = (body: unknown) =>
  Promise.resolve({
    json: () => Promise.resolve(body),
  } as Response);

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

  test("calls correct URL and returns title and authorNames on success", async () => {
    const mockFetch = vi.fn().mockReturnValue(
      makeResponse({
        items: [
          {
            volumeInfo: {
              title: "Test Book",
              authors: ["Author One", "Author Two"],
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("978-4-00-000000-1");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes?q=isbn:9784000000001",
    );
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.title).toBe("Test Book");
      expect(result.current.state.result.authorNames).toEqual([
        "Author One",
        "Author Two",
      ]);
    }
  });

  test("returns empty authorNames when authors field is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        makeResponse({
          items: [{ volumeInfo: { title: "No Authors Book" } }],
        }),
      ),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784000000001");
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.authorNames).toEqual([]);
    }
  });

  test("transitions to error when items array is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(makeResponse({ items: [] })),
    );

    const { result } = renderHook(() => useIsbnLookup());

    await act(async () => {
      await result.current.lookup("9784000000001");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
  });

  test("transitions to error when items key is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(makeResponse({})));

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
      await result.current.lookup("9784000000001");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
  });
});
