import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Center, Loader, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const queryClient = new QueryClient();

// Create a new router instance with auth context
const router = createRouter({
  routeTree,
  context: {
    // auth is injected by AuthGate after Auth0 initializes
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

/**
 * Auth0 の初期化が完了してから RouterProvider を mount することで、
 * beforeLoad が /?code=...&state=... のコールバック URL で発火する前に
 * Auth0 SDK が handleRedirectCallback() を完了することを保証する。
 * https://github.com/TanStack/router/discussions/1322
 */
function AuthGate() {
  const auth = useAuth0();
  if (auth.isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }
  return <RouterProvider router={router} context={{ auth }} />;
}

async function prepare() {
  if (import.meta.env.VITE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

prepare()
  .then(() => {
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <MantineProvider>
            <Notifications />
            <Auth0Provider
              domain={import.meta.env.VITE_AUTH0_DOMAIN}
              clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
              authorizationParams={{
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                redirect_uri: window.location.origin,
              }}
            >
              <AuthGate />
            </Auth0Provider>
          </MantineProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  })
  .catch((err: unknown) => {
    console.error("Failed to start MSW:", err);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <MantineProvider>
            <Notifications />
            <Auth0Provider
              domain={import.meta.env.VITE_AUTH0_DOMAIN}
              clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
              authorizationParams={{
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                redirect_uri: window.location.origin,
              }}
            >
              <AuthGate />
            </Auth0Provider>
          </MantineProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  });
