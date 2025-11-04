import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["node_modules/**"],
    // Suppress console output during tests
    silent: true,
    // Enable happy-dom environment
    // environment: "happy-dom",
    // Optional: enable globals like describe, it, expect
    // globals: true,
  },
});
