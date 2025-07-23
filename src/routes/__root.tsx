import { createRootRouteWithContext } from "@tanstack/react-router";
import App from "../App";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { GraphQLClient } from "graphql-request";

type GraphQLContextInterface = {
  client: GraphQLClient;
};

type MyRouterContext = {
  auth: Auth0ContextInterface;
  graphql: GraphQLContextInterface;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});
