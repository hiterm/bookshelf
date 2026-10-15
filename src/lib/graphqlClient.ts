import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/graphql-request";
import { graphqlApiUrl, isDemoMode } from "../config";

export const createGraphQLClient = (accessToken?: string): GraphQLSdk => {
  const client = new GraphQLClient(graphqlApiUrl, {
    headers:
      accessToken !== undefined && accessToken !== ""
        ? { authorization: `Bearer ${accessToken}` }
        : {},
  });
  return getSdk(client);
};

export const createAuthenticatedSdk = async (
  getAccessTokenSilently: () => Promise<string | undefined>,
): Promise<GraphQLSdk> => {
  if (isDemoMode) {
    return createGraphQLClient();
  }
  const token = await getAccessTokenSilently();
  if (token == null || token === "") {
    throw new Error("アクセストークンを取得できませんでした");
  }
  return createGraphQLClient(token);
};

export type GraphQLSdk = ReturnType<typeof getSdk>;
