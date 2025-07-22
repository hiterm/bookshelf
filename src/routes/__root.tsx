import { createRootRouteWithContext } from "@tanstack/react-router";
import App from "../App";
import { type Auth0ContextInterface, useAuth0 } from "@auth0/auth0-react";

interface MyRouterContext {
  auth: Auth0ContextInterface;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});
