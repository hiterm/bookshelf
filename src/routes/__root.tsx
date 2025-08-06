import { createRootRouteWithContext } from "@tanstack/react-router";
import App from "../App";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

type GraphQLContextInterface = {
  requestWithAuth: <T, V extends object = object>(
    doc: TypedDocumentNode<T, V>,
    variables?: V,
  ) => Promise<T>;
};

type MyRouterContext = {
  auth: Auth0ContextInterface;
  graphql: GraphQLContextInterface;
};

import { graphql } from "../generated/gql";

const LoggedInUserDocument = graphql(/* GraphQL */ `
  query loggedInUser {
    loggedInUser {
      id
    }
  }
`);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({ context }) => {
    const loggedInUserResponse = await context.graphql.requestWithAuth(
      LoggedInUserDocument,
    );
    return { loggedInUser: loggedInUserResponse.loggedInUser };
  },
  component: App,
});
