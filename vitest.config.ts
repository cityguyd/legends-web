import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Unit/component tests only. Playwright owns e2e/ (different runner).
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "e2e/**", ".next/**"],
  },
});
