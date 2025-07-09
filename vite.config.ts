/// <reference types="vite/client" />
/// <reference types="vitest" />

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginChecker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    vitePluginChecker({ typescript: true }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
