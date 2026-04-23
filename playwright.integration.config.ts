import { defineConfig, devices } from "@playwright/test";
import {
  TEST_AUTH0_CLIENT_ID,
  TEST_AUTH0_DOMAIN,
} from "./e2e-mock-api/testConstants";

export default defineConfig({
  testDir: "./e2e-integration",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      VITE_AUTH0_DOMAIN: TEST_AUTH0_DOMAIN,
      VITE_AUTH0_CLIENT_ID: TEST_AUTH0_CLIENT_ID,
      VITE_AUTH0_AUDIENCE: "test-audience",
      VITE_BOOKSHELF_API: "http://localhost:8080/graphql",
      VITE_DEMO_MODE: "false",
    },
  },
});
