import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./AuthGate";
import "./index.css";

const queryClient = new QueryClient();

async function prepare() {
  if (import.meta.env.VITE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

function renderApp() {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Notifications />
          <AppRoot />
        </MantineProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

prepare()
  .then(renderApp)
  .catch((err: unknown) => {
    console.error("Failed to start MSW:", err);
    renderApp();
  });
