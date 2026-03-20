import { Auth0ContextInterface } from "@auth0/auth0-react";
import { createRootRouteWithContext } from "@tanstack/react-router";
import App from "../App";

export type RouterContext = {
  auth: Auth0ContextInterface;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <App />;
}
