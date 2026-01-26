import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { GraphQLClient } from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

// Create a new router instance
const router = createRouter({
  routeTree,
  // This value is always overwritten
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  context: { auth: undefined!, graphql: undefined! },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

function AppWithRouterContext() {
  const auth = useAuth0();
  const client = new GraphQLClient(import.meta.env.VITE_BOOKSHELF_API);

  const requestWithAuth = async <
    TData,
    TVariables extends object | undefined = undefined,
  >(
    doc: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
  ): Promise<TData> => {
    if (import.meta.env.VITE_DEMO_MODE === "true") {
      return client.request(doc, variables);
    } else {
      const token = await auth.getAccessTokenSilently();
      return client.request(doc, variables, {
        Authorization: `Bearer ${token}`,
      });
    }
  };

  return (
    <RouterProvider
      router={router}
      context={{ auth, graphql: { requestWithAuth } }}
    />
  );
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
    >
      <AppWithRouterContext />
    </Auth0Provider>
  </React.StrictMode>,
);
