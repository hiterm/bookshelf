/// <reference types="vite/client" />
/// <reference types="vitest" />

import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import vitePluginChecker from "vite-plugin-checker";

function excludeMockServiceWorker(): Plugin {
  return {
    name: "exclude-mock-service-worker",
    apply: "build",
    closeBundle() {
      if (process.env.VITE_DEMO_MODE !== "true") {
        const mockServiceWorkerPath = resolve("dist/mockServiceWorker.js");
        if (existsSync(mockServiceWorkerPath)) {
          unlinkSync(mockServiceWorkerPath);
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  preview: { port: 4173 },
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    vitePluginChecker({ typescript: true }),
    excludeMockServiceWorker(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/e2e/**", "**/e2e-demo/**"],
  },
});
