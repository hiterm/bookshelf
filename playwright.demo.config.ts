import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-demo",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
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
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      VITE_AUTH0_DOMAIN: "",
      VITE_AUTH0_CLIENT_ID: "",
      VITE_AUTH0_AUDIENCE: "",
      VITE_BOOKSHELF_API: "https://mock-bookshelf-api.vercel.app/api/graphql",
      VITE_DEMO_MODE: "true",
    },
  },
});
