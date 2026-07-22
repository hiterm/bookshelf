import { defineConfig, devices } from "@playwright/test";

const isCi = process.env.CI !== undefined && process.env.CI !== "";

export default defineConfig({
  testDir: "./e2e-demo-mode",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  use: {
    baseURL: "http://localhost:4173",
    trace: "off",
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
    reuseExistingServer: !isCi,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      VITE_AUTH0_DOMAIN: "",
      VITE_AUTH0_CLIENT_ID: "",
      VITE_AUTH0_AUDIENCE: "",
      VITE_DEMO_MODE: "true",
    },
  },
});
