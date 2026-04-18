/// <reference types="vite/client" />
/// <reference types="vitest" />

import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import vitePluginChecker from "vite-plugin-checker";

function excludeMockServiceWorker(): Plugin {
  let demoMode: boolean;
  let outDir: string;

  return {
    name: "exclude-mock-service-worker",
    apply: "build",
    configResolved(config) {
      const env = loadEnv(config.mode, process.cwd(), "");
      demoMode = env.VITE_DEMO_MODE === "true";
      outDir = config.build.outDir;
    },
    closeBundle() {
      if (!demoMode) {
        const mockServiceWorkerPath = resolve(outDir, "mockServiceWorker.js");
        if (existsSync(mockServiceWorkerPath)) {
          unlinkSync(mockServiceWorkerPath);
        }
      }
    },
  };
}

const PROXY_CONFIG = {
  "/ndl-proxy": {
    target: "https://ndlsearch.ndl.go.jp",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/ndl-proxy/, ""),
  },
  "/openbd-proxy": {
    target: "https://api.openbd.jp",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/openbd-proxy/, ""),
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: PROXY_CONFIG,
  },
  preview: {
    port: 4173,
    proxy: PROXY_CONFIG,
  },
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
