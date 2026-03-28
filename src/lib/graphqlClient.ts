import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/graphql-request";
import { graphqlApiUrl, isDemoMode } from "../config";

export const createGraphQLClient = (accessToken?: string) => {
  const client = new GraphQLClient(graphqlApiUrl, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
  });
  return getSdk(client);
};

export const createAuthenticatedSdk = async (
  getAccessTokenSilently: () => Promise<string>,
) => {
  if (isDemoMode) {
    return createGraphQLClient();
  }
  const token = await getAccessTokenSilently();
  return createGraphQLClient(token);
};

export type GraphQLSdk = ReturnType<typeof getSdk>;
