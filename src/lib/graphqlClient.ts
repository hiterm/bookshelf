import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/graphql-request";
import { graphqlApiUrl } from "../config";

export const createGraphQLClient = (accessToken?: string) => {
  const client = new GraphQLClient(graphqlApiUrl, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
  });
  return getSdk(client);
};

export type GraphQLSdk = ReturnType<typeof getSdk>;
