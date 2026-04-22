/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { importJWK, importPKCS8, SignJWT } from "jose";
import { TEST_AUTH0_CLIENT_ID, TEST_AUTH0_DOMAIN } from "../e2e/testConstants";
import { TEST_PRIVATE_KEY_JWK } from "../e2e/testKeys";

const dir = path.dirname(fileURLToPath(import.meta.url));
const INTEGRATION_PRIVATE_KEY_PEM = readFileSync(
  path.join(dir, "integrationTestPrivateKey.pem"),
  "utf-8",
);

async function buildIdToken(nonce: string, userId: string): Promise<string> {
  const privateKey = await importJWK(TEST_PRIVATE_KEY_JWK, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    sub: userId,
    name: "Test User",
    email: "test@example.com",
    nonce,
  })
    .setProtectedHeader({ alg: "RS256", kid: TEST_PRIVATE_KEY_JWK.kid })
    .setIssuer(`https://${TEST_AUTH0_DOMAIN}/`)
    .setAudience(TEST_AUTH0_CLIENT_ID)
    .setIssuedAt(now)
    .setExpirationTime(now + 86400)
    .sign(privateKey);
}

async function buildAccessToken(userId: string): Promise<string> {
  const privateKey = await importPKCS8(INTEGRATION_PRIVATE_KEY_PEM, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "test-key-id" })
    .setIssuer("https://test-issuer.local/")
    .setAudience("test-audience")
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + 86400)
    .sign(privateKey);
}

export const test = base.extend<Record<never, never>>({
  page: async ({ page }, useFixture) => {
    const userId = crypto.randomUUID();

    // Auth0 authorize endpoint mock
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/authorize**`,
      async (route) => {
        const url = new URL(route.request().url());
        const redirectUri = url.searchParams.get("redirect_uri");
        const state = url.searchParams.get("state");
        const nonce = url.searchParams.get("nonce") ?? "";
        const responseMode = url.searchParams.get("response_mode");

        if (!redirectUri || !state) {
          await route.abort();
          return;
        }

        const encodedNonce = Buffer.from(nonce).toString("base64url");
        const mockCode = `mock-auth-code::${encodedNonce}`;

        if (responseMode === "web_message") {
          const html = `
<!DOCTYPE html>
<html>
<head><title>Auth0 Mock</title></head>
<body>
<script>
window.parent.postMessage({
  type: 'authorization_response',
  response: {
    code: '${mockCode}',
    state: '${state}'
  }
}, '*');
</script>
</body>
</html>`;
          await route.fulfill({
            status: 200,
            contentType: "text/html",
            body: html,
          });
          return;
        }

        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set("code", mockCode);
        callbackUrl.searchParams.set("state", state);

        await route.fulfill({
          status: 302,
          headers: {
            Location: callbackUrl.toString(),
          },
        });
      },
    );

    // Auth0 token endpoint mock
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/oauth/token`,
      async (route) => {
        const body = route.request().postData();
        if (!body) {
          await route.abort();
          return;
        }
        const params = new URLSearchParams(body);
        const code = params.get("code") ?? "";

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

        const idToken = await buildIdToken(nonce, userId);
        const accessToken = await buildAccessToken(userId);

        await route.fulfill({
          json: {
            access_token: accessToken,
            id_token: idToken,
            token_type: "Bearer",
            expires_in: 86400,
            scope: "openid profile email",
          },
        });
      },
    );

    // Auth0 JWKS endpoint mock (for id_token validation by Auth0 browser SDK)
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/.well-known/jwks.json`,
      async (route) => {
        await route.fulfill({
          json: {
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
          },
        });
      },
    );

    // Auth0 logout endpoint mock
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/v2/logout**`,
      async (route) => {
        const url = new URL(route.request().url());
        const returnTo = url.searchParams.get("returnTo") ?? "/";
        await route.fulfill({
          status: 302,
          headers: {
            Location: returnTo,
          },
        });
      },
    );

    await useFixture(page);
  },
});
