![ci](https://github.com/hiterm/bookshelf/actions/workflows/ci.yml/badge.svg)
![vercel](https://vercelbadge.vercel.app/api/hiterm/bookshelf)

# Bookshelf

Web App for books management (currently only accesible to me)

## Backend

- [Bookshelf API](https://github.com/hiterm/bookshelf-api) v1.1.1

## Dependent platforms

- Auth0

## How to run locally

Read this: https://auth0.com/docs/quickstart/spa/react.

```
cp .env.template .env.development
vim .env.development  # fill your value
```

Start [Bookshelf API](https://github.com/hiterm/bookshelf-api).

```
yarn generate
yarn start
```

## Environment variables

| name                 | description                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| VITE_AUTH0_DOMAIN    | Auth0 domain. See https://auth0.com/docs/quickstart/spa/react/interactive.                                                                   |
| VITE_AUTH0_CLIENT_ID | Auth0 client id. See https://auth0.com/docs/quickstart/spa/react/interactive.                                                                |
| VITE_AUTH0_AUDIENCE  | The identifier of Bookshelf API. See https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens#parameters.                        |
| VITE_BOOKSHELF_API   | An URL of Bookshelf API endpoint.                                                                                                            |
| VITE_DEMO_MODE       | If it is 'true', sign-in will be skipped. It is intended to be used with [mock-bookshelf-api](https://github.com/hiterm/mock-bookshelf-api). |
