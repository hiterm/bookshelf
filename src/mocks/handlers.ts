import { makeExecutableSchema } from "@graphql-tools/schema";
import { importJWK, SignJWT } from "jose";
import { graphql, HttpResponse, http } from "msw";
// eslint-disable-next-line import/no-unresolved
import schemaString from "../graphql/schema.graphql?raw";
import { mockStore } from "./mockStore";
import { TEST_AUTH0_CLIENT_ID, TEST_AUTH0_DOMAIN } from "./testConstants";
import { TEST_PRIVATE_KEY_JWK } from "./testKeys";

const AUTH0_DOMAIN = TEST_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = TEST_AUTH0_CLIENT_ID;

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

const resolvers = {
  Query: {
    loggedInUser: () => ({ id: "test-user-id" }),
    authors: () => mockStore.getAllAuthors(),
    author: (_: unknown, { id }: { id: string }) => mockStore.getAuthor(id),
    books: () => mockStore.getAllBooks(),
    book: (_: unknown, { id }: { id: string }) => mockStore.getBook(id),
  },
  Mutation: {
    registerUser: () => ({ id: "test-user-id" }),
    createAuthor: (
      _: unknown,
      { authorData }: { authorData: { name: string } },
    ) => mockStore.createAuthor(authorData.name),
    createBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.createBook>[0] },
    ) => mockStore.createBook(bookData),
    updateBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.updateBook>[0] },
    ) => mockStore.updateBook(bookData),
    deleteBook: (_: unknown, { bookId }: { bookId: string }) => {
      const deleted = mockStore.deleteBook(bookId);
      return deleted ? bookId : null;
    },
  },
  Book: {
    authors: (book: { authorIds: string[] }) => {
      return book.authorIds
        .map((id) => mockStore.getAuthor(id))
        .filter(
          (author): author is NonNullable<typeof author> => author !== null,
        );
    },
  },
};

const executableSchema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers,
});

export const handlers = [
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

  http.post(`https://${AUTH0_DOMAIN}/oauth/token`, async ({ request }) => {
    const body = await request.text();
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

    return HttpResponse.json({
      access_token: "mock-access-token",
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 86400,
      scope: "openid profile email",
    });
  }),

  graphql.operation(async ({ query, variables }) => {
    const { graphqlSync } = await import("graphql");
    const result = graphqlSync({
      schema: executableSchema,
      source: query,
      variableValues: variables,
    });
    return HttpResponse.json(result);
  }),
];
