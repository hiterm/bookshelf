import { createRootRouteWithContext } from "@tanstack/react-router";
import App from "../App";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

type GraphQLContextInterface = {
  requestWithAuth: <T, V extends object = object>(
    doc: TypedDocumentNode<T, V>,
    variables?: V
  ) => Promise<T>;
};

type MyRouterContext = {
  auth: Auth0ContextInterface;
  graphql: GraphQLContextInterface;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});
