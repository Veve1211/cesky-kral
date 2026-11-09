// End-to-end tests (Playwright). See README.md, section "Testy".
//
// The app runs as a production build (`next start`) against a separate
// TEST database given in E2E_DATABASE_URL. Global setup migrates and seeds it.
import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

import { TEST_KOFI_URL } from "./e2e/helpers/kofi";

// Local runs may keep E2E_DATABASE_URL in .env.local (never commit it).
loadEnv({ path: ".env.local", quiet: true });

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

// Claude Code on the web ships a pre-installed Chromium; elsewhere
// (CI, your computer) `npx playwright install chromium` provides one.
const PREINSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath =
  !isCI && existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined;

// CI builds the app in its own step; locally the web server builds first.
const startCommand = `npm run start:app -- --port ${PORT}`;
const webServerCommand = process.env.E2E_SKIP_BUILD
  ? startCommand
  : `npm run build && ${startCommand}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    locale: "cs-CZ",
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // iPhone 13 screen, touch and user agent – rendered by Chromium,
      // so one browser download is enough.
      name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      // The app reads only the test database during the tests.
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? "",
      // Built into the app, so the Ko-fi button shows in the tests.
      NEXT_PUBLIC_KOFI_URL: TEST_KOFI_URL,
      // Hundreds of games come from this one machine; requests from the
      // local machine skip the rate limit (never set in production). The
      // rate-limit test uses its own fake client address.
      E2E_RATE_LIMIT_LOOPBACK_EXEMPT: "1",
    },
  },
});
