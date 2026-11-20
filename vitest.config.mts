import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests of pure game logic (no database, no browser). E2E tests live in e2e/ (Playwright).
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
