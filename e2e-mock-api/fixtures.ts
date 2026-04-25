/* eslint-disable react-hooks/rules-of-hooks */
import { makeExecutableSchema } from "@graphql-tools/schema";
import { test as base } from "@playwright/test";
import { readFileSync } from "fs";
import { graphqlSync } from "graphql";
import { importJWK, SignJWT } from "jose";
import { z } from "zod";
import type { MockStore } from "./mockStore";
import { createResolvers } from "./resolvers";
import { TEST_AUTH0_CLIENT_ID, TEST_AUTH0_DOMAIN } from "./testConstants";
import { TEST_PRIVATE_KEY_JWK } from "./testKeys";

const schemaString = readFileSync(
  new URL("../src/graphql/schema.graphql", import.meta.url),
  "utf-8",
);

const DEBUG = process.env.DEBUG_E2E === "true";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const log = DEBUG ? console.log : () => {};

async function buildIdToken(nonce: string): Promise<string> {
  const privateKey = await importJWK(TEST_PRIVATE_KEY_JWK, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    sub: "auth0|test-user-id",
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

export const test = base.extend<{
  mockStore: MockStore;
  isNewUser: boolean;
}>({
  isNewUser: false,
  mockStore: async ({ isNewUser }, useFixture) => {
    const { MockStore } = await import("./mockStore");
    const store = new MockStore({ userRegistered: !isNewUser });
    await useFixture(store);
  },

  page: async ({ page, mockStore }, useFixture) => {
    page.on("request", (request) => {
      log(`>> ${request.method()} ${request.url()}`);
    });

    // Auth0 authorize endpoint mock
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/authorize**`,
      async (route) => {
        log("Auth0 authorize route hit");
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
        log("Auth0 token route hit");
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

        const idToken = await buildIdToken(nonce);

        await route.fulfill({
          json: {
            access_token: "mock-access-token",
            id_token: idToken,
            token_type: "Bearer",
            expires_in: 86400,
            scope: "openid profile email",
          },
        });
      },
    );

    // Auth0 JWKS endpoint mock
    await page.route(
      `https://${TEST_AUTH0_DOMAIN}/.well-known/jwks.json`,
      async (route) => {
        log("Auth0 JWKS route hit");
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
        log("Auth0 logout route hit");
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

    // GraphQL mock
    await page.route("http://localhost:4000/graphql", async (route) => {
      log("GraphQL route hit");
      try {
        const graphqlRequestSchema = z.object({
          query: z.string(),
          variables: z.record(z.string(), z.unknown()).optional(),
        });
        const body = graphqlRequestSchema.parse(route.request().postDataJSON());
        log("GraphQL query:", body.query.substring(0, 50));
        const { query, variables } = body;

        const resolvers = createResolvers(mockStore);
        const executableSchema = makeExecutableSchema({
          typeDefs: schemaString,
          resolvers,
        });

        const result = graphqlSync({
          schema: executableSchema,
          source: query,
          variableValues: variables,
        });

        log("GraphQL result:", JSON.stringify(result).substring(0, 100));
        await route.fulfill({ json: result });
      } catch (error) {
        console.error("GraphQL mock error:", error);
        await route.fulfill({ status: 500, json: { error: String(error) } });
      }
    });

    await useFixture(page);
  },
});
