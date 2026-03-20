import type { Page } from "@playwright/test";

const AUTH0_DOMAIN = "test.auth0.hiterm.dev";

/**
 * Auth0 の /authorize をモックして認証済み状態にする。
 *
 * Auth0 SDK の PKCE フロー:
 *   1. /authorize?state=...&nonce=...&code_challenge=... へリダイレクト
 *   2. 認証後、redirect_uri?code=...&state=... へコールバック
 *   3. POST /oauth/token で code + code_verifier を送りトークンを取得
 *
 * nonce を code に埋め込んで MSW の /oauth/token ハンドラーに渡す。
 * MSW ハンドラーが code から nonce を取り出して id_token を生成する。
 *
 * フォーマット: code = "mock-auth-code::<base64url(nonce)>"
 */
export async function mockAuth0Login(page: Page): Promise<void> {
  await page.route(`https://${AUTH0_DOMAIN}/authorize**`, async (route) => {
    const url = new URL(route.request().url());
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");
    const nonce = url.searchParams.get("nonce") ?? "";

    if (!redirectUri || !state) {
      await route.abort();
      return;
    }

    // nonce を code に埋め込む (MSW ハンドラーが取り出して id_token を生成する)
    const encodedNonce = Buffer.from(nonce).toString("base64url");
    const mockCode = `mock-auth-code::${encodedNonce}`;

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("code", mockCode);
    callbackUrl.searchParams.set("state", state);

    await route.fulfill({
      status: 302,
      headers: {
        Location: callbackUrl.toString(),
      },
    });
  });
}
