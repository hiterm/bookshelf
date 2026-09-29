import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useOpenBdDetail } from "./useOpenBdDetail";

const response = (body: unknown): Response =>
  new Response(JSON.stringify(body));
const entry = (description: string): unknown[] => [
  {
    onix: {
      CollateralDetail: {
        TextContent: [{ TextType: "03", Text: description }],
      },
    },
  },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "debug").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("maps visible bibliographic details and prefers the full description regardless of order", async () => {
  const body = [
    {
      summary: {
        cover: "https://example.com/cover.jpg",
        pubdate: "202609",
        series: "Series",
        volume: "2",
      },
      hanmoto: { genrename: "Science" },
      onix: {
        CollateralDetail: {
          TextContent: [
            { TextType: "02", Text: "Short" },
            { TextType: "04", Text: "Contents" },
            { TextType: "03", Text: "Full" },
          ],
        },
        DescriptiveDetail: {
          ProductFormDetail: "B401",
          Extent: [
            { ExtentType: "99", ExtentValue: "999" },
            { ExtentType: "11", ExtentValue: "240" },
          ],
        },
      },
    },
  ];
  vi.mocked(fetch).mockResolvedValueOnce(response(body));
  const { result } = renderHook(() => useOpenBdDetail());
  await act(async () => {
    await result.current.fetch("978-4 01");
  });
  expect(fetch).toHaveBeenCalledWith("/openbd-proxy/v1/get?isbn=978-4%2001");
  expect(result.current.state).toEqual({
    status: "success",
    rawData: body,
    detail: {
      coverImageUrl: "https://example.com/cover.jpg",
      publishedDate: "202609",
      series: "Series",
      volume: "2",
      genre: "Science",
      description: "Full",
      tableOfContents: "Contents",
      format: "文庫判",
      pageCount: 240,
    },
  });
});

test.each([undefined, ""])(
  "falls back to short description when full text is %s",
  async (full) => {
    vi.mocked(fetch).mockResolvedValueOnce(
      response([
        {
          onix: {
            CollateralDetail: {
              TextContent: [
                { TextType: "03", Text: full },
                { TextType: "02", Text: "Fallback" },
              ],
            },
          },
        },
      ]),
    );
    const { result } = renderHook(() => useOpenBdDetail());
    await act(async () => {
      await result.current.fetch("isbn");
    });
    expect(result.current.state).toMatchObject({
      status: "success",
      detail: { description: "Fallback" },
    });
  },
);

test.each(["0", "-1", "1.5", "NaN", "Infinity", "", "240 pages"])(
  "does not display invalid page count %s",
  async (value) => {
    vi.mocked(fetch).mockResolvedValueOnce(
      response([
        {
          onix: {
            DescriptiveDetail: {
              Extent: [{ ExtentType: "11", ExtentValue: value }],
            },
          },
        },
      ]),
    );
    const { result } = renderHook(() => useOpenBdDetail());
    await act(async () => {
      await result.current.fetch("isbn");
    });
    expect(result.current.state).toMatchObject({
      status: "success",
      detail: { pageCount: undefined },
    });
  },
);

test.each([{ body: [] }, { body: [null] }, { body: [{}] }])(
  "accepts missing details: $body",
  async ({ body }) => {
    vi.mocked(fetch).mockResolvedValueOnce(response(body));
    const { result } = renderHook(() => useOpenBdDetail());
    await act(async () => {
      await result.current.fetch("isbn");
    });
    expect(result.current.state).toEqual({
      status: "success",
      detail: {},
      rawData: body,
    });
  },
);

test("omits blank summary fields and unknown format codes", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    response([
      {
        summary: { cover: "", pubdate: "", series: "", volume: "" },
        onix: { DescriptiveDetail: { ProductFormDetail: "UNKNOWN" } },
      },
    ]),
  );
  const { result } = renderHook(() => useOpenBdDetail());
  await act(async () => {
    await result.current.fetch("isbn");
  });
  expect(result.current.state).toMatchObject({
    status: "success",
    detail: {
      coverImageUrl: undefined,
      publishedDate: undefined,
      series: undefined,
      volume: undefined,
      format: undefined,
    },
  });
});

const failures = [
  {
    name: "HTTP",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.resolve(new Response("Unavailable", { status: 503 }));
    },
  },
  {
    name: "network",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.reject(new Error("Offline"));
    },
  },
  {
    name: "JSON",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.resolve(new Response("{broken"));
    },
  },
  {
    name: "shape",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.resolve(response({ unexpected: true }));
    },
  },
  {
    name: "nested shape",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.resolve(
        response([{ onix: { CollateralDetail: { TextContent: {} } } }]),
      );
    },
  },
];

test.each(failures)("recovers after $name failure", async ({ settle }) => {
  const pending = Promise.withResolvers<Response>();
  vi.mocked(fetch)
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(response(entry("Recovered")));
  const { result } = renderHook(() => useOpenBdDetail());
  let completion: Promise<void>;
  act(() => {
    completion = result.current.fetch("old");
  });
  expect(result.current.state.status).toBe("loading");
  await act(async () => {
    settle(pending);
    await completion;
  });
  expect(result.current.state).toEqual({
    status: "error",
    message: "詳細情報を取得できませんでした",
  });
  await act(async () => {
    await result.current.fetch("new");
  });
  expect(result.current.state).toMatchObject({
    status: "success",
    detail: { description: "Recovered" },
  });
});

const completions = [
  {
    name: "success",
    settle: (pending: ReturnType<typeof Promise.withResolvers<Response>>) => {
      pending.resolve(response(entry("Old")));
    },
  },
  ...failures,
];
describe.each(["newer ISBN", "reset"] as const)("after %s", (action) => {
  test.each(completions)(
    "ignores completed stale $name",
    async ({ settle }) => {
      const pending = Promise.withResolvers<Response>();
      vi.mocked(fetch)
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValueOnce(response(entry("New")));
      const { result } = renderHook(() => useOpenBdDetail());
      let oldCompletion: Promise<void>;
      act(() => {
        oldCompletion = result.current.fetch("old");
      });
      expect(result.current.state.status).toBe("loading");
      await act(async () => {
        if (action === "reset") result.current.reset();
        else await result.current.fetch("new");
      });
      const expected =
        action === "reset"
          ? { status: "idle" }
          : { status: "success", detail: { description: "New" } };
      expect(result.current.state).toMatchObject(expected);
      await act(async () => {
        settle(pending);
        await oldCompletion;
      });
      expect(result.current.state).toMatchObject(expected);
      expect(fetch).toHaveBeenCalledTimes(action === "reset" ? 1 : 2);
    },
  );
});
