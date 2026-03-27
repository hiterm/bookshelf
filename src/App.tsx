import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AppRoot } from "./AuthGate";
import { queryClient } from "./lib/queryClient";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppRoot />
      </MantineProvider>
    </QueryClientProvider>
  );
};
