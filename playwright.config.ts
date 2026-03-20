import { defineConfig, devices } from "@playwright/test";
import { TEST_AUTH0_CLIENT_ID, TEST_AUTH0_DOMAIN } from "./e2e/testConstants";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
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
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      VITE_AUTH0_DOMAIN: TEST_AUTH0_DOMAIN,
      VITE_AUTH0_CLIENT_ID: TEST_AUTH0_CLIENT_ID,
      VITE_AUTH0_AUDIENCE: "test-audience",
      VITE_BOOKSHELF_API: "http://localhost:4000/graphql",
      VITE_DEMO_MODE: "false",
    },
  },
});
