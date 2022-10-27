/// <reference types="vite/client" />

// eslint-disable-next-line no-unused-vars
interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE: string;
  readonly VITE_BOOKSHELF_API: string;
  readonly VITE_DEMO_MODE: string;
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
