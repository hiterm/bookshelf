![ci](https://github.com/hiterm/bookshelf/actions/workflows/ci.yml/badge.svg)
![vercel](https://vercelbadge.vercel.app/api/hiterm/bookshelf)

# Bookshelf

Web App for books management (currently only accesible to me)

## Backend

- [Bookshelf API](https://github.com/hiterm/bookshelf-api) v1.0.0

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
