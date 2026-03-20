import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AppRoot } from "./AuthGate";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        <AppRoot />
      </MantineProvider>
    </QueryClientProvider>
  );
};
