import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      enabled: false, // Enable via --coverage flag
      exclude: [
        "node_modules/",
        "tests/",
        "scripts/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/vitest.setup.ts",
        "**/next.config.ts",
        "**/postcss.config.mjs",
        "**/eslint.config.mjs",
      ],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
