import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rstest/core";

export default defineConfig({
  plugins: [pluginReact()],
  globals: true,
  testEnvironment: "jsdom",
  pool: "vmThreads",
  setupFiles: ["./src/test/setup.ts"],
  exclude: [
    "**/node_modules/**",
    "**/e2e-mock-api/**/*.spec.ts",
    "**/e2e-demo-mode/**",
    "**/e2e-integration/**",
  ],
  output: {
    externals: ["zod", /^zod\//],
  },
});
