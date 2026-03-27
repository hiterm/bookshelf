export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const graphqlApiUrl = isDemoMode
  ? `${window.location.origin}/api/graphql`
  : import.meta.env.VITE_BOOKSHELF_API;
