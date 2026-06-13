import { defineConfig, devices } from "@playwright/test";

// Ports — keep the mock engine off Next's 3000 and Supabase's 54321.
const MOCK_ENGINE_PORT = 8787;
const WEB_PORT = 3000;
// Use "localhost" (not 127.0.0.1) — Next 16 dev only serves its client/HMR
// assets to its own dev origin, and accessing via a different host (127.0.0.1)
// triggers the allowedDevOrigins guard and blocks hydration.
const BASE_URL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Funnel is sequential by nature (the mock engine counts requests globally),
  // so run a single worker to keep its limit counter deterministic.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      // Dependency-free mock engine (no build step) run straight by node.
      // Never reuse — the engine holds per-session request counts, so a fresh
      // process each run keeps the daily-limit fixture deterministic.
      command: "node e2e/mock-engine.mjs",
      port: MOCK_ENGINE_PORT,
      reuseExistingServer: false,
      env: { MOCK_ENGINE_PORT: String(MOCK_ENGINE_PORT) },
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npm run dev",
      port: WEB_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        // Activate the data-layer fixture seam (see lib/marketing/data.ts).
        E2E_MOCK_DATA: "1",
        // Point the chat client at the mock engine.
        NEXT_PUBLIC_ENGINE_URL: `http://127.0.0.1:${MOCK_ENGINE_PORT}`,
        // Dummy Supabase env so the auth clients construct without throwing.
        // No session cookie exists in E2E, so getUser() returns null and the
        // anonymous flow runs without any network call to these hosts.
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-dummy-anon-key",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
