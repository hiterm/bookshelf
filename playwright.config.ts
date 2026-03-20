import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      VITE_AUTH0_DOMAIN: "test.auth0.hiterm.dev",
      VITE_AUTH0_CLIENT_ID: "test-client-id",
      VITE_AUTH0_AUDIENCE: "test-audience",
      VITE_BOOKSHELF_API: "http://localhost:4000/graphql",
      VITE_MSW: "true",
      VITE_DEMO_MODE: "false",
    },
  },
});
