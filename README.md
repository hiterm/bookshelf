![ci](https://github.com/hiterm/bookshelf/actions/workflows/ci.yml/badge.svg)
![vercel](https://vercelbadge.vercel.app/api/hiterm/bookshelf)

# Bookshelf

Web App for books management

## Demo

https://bookshelf-demo.vercel.app/

The demo app requires no sign-in. Changes are stored locally only - they are not persisted to the server and will be lost on page reload.

## Backend

- [Bookshelf API](https://github.com/hiterm/bookshelf-api) (for local development)
- MSW (Mock Service Worker) (for demo - set VITE_DEMO_MODE=true)

## Dependent platforms

- Auth0

## How to run locally

### Local development with Bookshelf API

Read this: https://auth0.com/docs/quickstart/spa/react.

```bash
cp .env.template .env.development
vim .env.development  # fill in your values
```

Start the development server:

```bash
npm run generate
npm start
```

This requires [Bookshelf API](https://github.com/hiterm/bookshelf-api) to be running separately.

### Demo mode locally

To run the demo locally (without Auth0 and using MSW):

```bash
VITE_DEMO_MODE=true npm start
```

## Environment variables

| name                 | description                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| VITE_AUTH0_DOMAIN    | Auth0 domain. See https://auth0.com/docs/quickstart/spa/react/interactive.                                                                   |
| VITE_AUTH0_CLIENT_ID | Auth0 client id. See https://auth0.com/docs/quickstart/spa/react/interactive.                                                                |
| VITE_AUTH0_AUDIENCE  | The identifier of Bookshelf API. See https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens#parameters.                        |
| VITE_BOOKSHELF_API   | An URL of Bookshelf API endpoint.                                                                                                            |
| VITE_DEMO_MODE       | If it is 'true', sign-in will be skipped and MSW will intercept GraphQL requests. |

## Deploy to production

Commit into `main`.

## E2E Testing

Run E2E tests:

```bash
npm run test:e2e
```

Enable debug logging:

```bash
DEBUG_E2E=true npm run test:e2e
```

This will output GraphQL queries and responses for debugging test failures.

Run demo E2E tests:

```bash
npm run test:e2e:demo
```

## NDL Proxy

The book registration form's ISBN auto-fill fetches metadata from the National Diet Library (NDL) OpenSearch API. NDL does not send CORS headers, so browsers block direct cross-origin requests to `https://ndlsearch.ndl.go.jp`.

To work around this, the hook calls the relative path `/ndl-proxy/api/opensearch?isbn=...`, which each environment forwards to `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=...`:

- **Development** (`npm start`): Vite dev server proxy configured in `vite.config.ts` under `server.proxy`.
- **E2E tests** (`npm run test:e2e`): Vite preview server proxy configured in `vite.config.ts` under `preview.proxy`.
- **Production** (Vercel): Rewrite rule in `vercel.json` forwards `/ndl-proxy/:path*` to `https://ndlsearch.ndl.go.jp/:path*`.
