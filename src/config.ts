export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const configuredGraphqlApiUrl = import.meta.env.VITE_BOOKSHELF_API as
  | string
  | undefined;

export const graphqlApiUrl = isDemoMode
  ? `${window.location.origin}/api/graphql`
  : (configuredGraphqlApiUrl ?? "");

export const apiBaseUrl = graphqlApiUrl.replace(/\/graphql\/?$/, "");
