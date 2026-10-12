import { vi } from "vitest";
import { createAuthenticatedSdk } from "./graphqlClient";

const config = vi.hoisted(() => ({
  isDemoMode: false,
  graphqlApiUrl: "https://api.example.com/graphql",
}));
vi.mock("../config", () => config);

describe("createAuthenticatedSdk", () => {
  afterEach(() => {
    config.isDemoMode = false;
    vi.unstubAllGlobals();
  });

  test.each([undefined, ""])("rejects a missing token (%s)", async (token) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      createAuthenticatedSdk(() => Promise.resolve(token)),
    ).rejects.toThrow("アクセストークンを取得できませんでした");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("sends the access token in the authorization header", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { books: [] } }), {
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const sdk = await createAuthenticatedSdk(() =>
      Promise.resolve("test-token"),
    );
    await sdk.books();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(
      typeof url === "string" ? url : url instanceof URL ? url.href : url.url,
    ).toBe(config.graphqlApiUrl);
    expect(new Headers(options?.headers).get("authorization")).toBe(
      "Bearer test-token",
    );
  });

  test("skips token acquisition in demo mode", async () => {
    config.isDemoMode = true;
    const getToken = vi.fn<() => Promise<string | undefined>>();
    await createAuthenticatedSdk(getToken);
    expect(getToken).not.toHaveBeenCalled();
  });
});
