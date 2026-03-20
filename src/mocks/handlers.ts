import { importJWK, SignJWT } from "jose";
import { graphql, HttpResponse, http } from "msw";
import { TEST_PRIVATE_KEY_JWK } from "./testKeys";

const AUTH0_DOMAIN = "test.auth0.hiterm.dev";
const AUTH0_CLIENT_ID = "test-client-id";

/**
 * RS256 で署名した Auth0 互換の id_token を生成する。
 * MSW の /oauth/token ハンドラーから呼ばれる。
 *
 * @param nonce /authorize リクエストの nonce パラメータ。
 *              code に埋め込まれた base64url エンコード済み文字列をデコードして渡す。
 */
async function buildIdToken(nonce: string): Promise<string> {
  const privateKey = await importJWK(TEST_PRIVATE_KEY_JWK, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    sub: "auth0|test-user-id",
    name: "Test User",
    email: "test@example.com",
    nonce,
  })
    .setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
    .setIssuer(`https://${AUTH0_DOMAIN}/`)
    .setAudience(AUTH0_CLIENT_ID)
    .setIssuedAt(now)
    .setExpirationTime(now + 86400)
    .sign(privateKey);
}

export const handlers = [
  // Auth0: JWKS エンドポイント (id_token の署名検証用)
  http.get(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`, () => {
    return HttpResponse.json({
      keys: [
        {
          kty: "RSA",
          n: TEST_PRIVATE_KEY_JWK.n,
          e: TEST_PRIVATE_KEY_JWK.e,
          kid: TEST_PRIVATE_KEY_JWK.kid,
          use: "sig",
          alg: "RS256",
        },
      ],
    });
  }),

  // Auth0: トークンエンドポイント
  // code パラメータに nonce が埋め込まれている:
  //   code = "mock-auth-code::<base64url(nonce)>"
  http.post(`https://${AUTH0_DOMAIN}/oauth/token`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const code = params.get("code") ?? "";

    // code から nonce を取り出す
    const parts = code.split("::");
    const nonce =
      parts.length >= 2
        ? new TextDecoder().decode(
            Uint8Array.from(
              atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
              (c) => c.charCodeAt(0),
            ),
          )
        : "";

    const idToken = await buildIdToken(nonce);

    return HttpResponse.json({
      access_token: "mock-access-token",
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 86400,
      scope: "openid profile email",
    });
  }),

  // GraphQL: loggedInUser (RegisterCheck を通過させる)
  graphql.query("loggedInUser", () => {
    return HttpResponse.json({
      data: {
        loggedInUser: { id: "test-user-id" },
      },
    });
  }),

  // GraphQL: books (書籍一覧)
  graphql.query("books", () => {
    return HttpResponse.json({
      data: {
        books: [
          {
            id: "book-1",
            title: "テスト書籍1",
            authors: [{ id: "author-1", name: "著者1" }],
            isbn: "978-4-00-000001-0",
            read: false,
            owned: true,
            priority: 50,
            format: "PRINTED",
            store: "UNKNOWN",
            createdAt: 1700000000,
            updatedAt: 1700000000,
          },
          {
            id: "book-2",
            title: "テスト書籍2",
            authors: [{ id: "author-2", name: "著者2" }],
            isbn: "978-4-00-000002-7",
            read: true,
            owned: true,
            priority: 80,
            format: "E_BOOK",
            store: "KINDLE",
            createdAt: 1700000001,
            updatedAt: 1700000001,
          },
        ],
      },
    });
  }),

  // GraphQL: authors (BookForm などで使用)
  graphql.query("authors", () => {
    return HttpResponse.json({
      data: {
        authors: [
          { id: "author-1", name: "著者1" },
          { id: "author-2", name: "著者2" },
        ],
      },
    });
  }),
];
