import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        // The runtime bundled with the test pool is older than the deployed one.
        compatibilityDate: "2026-08-22",
      },
    }),
  ],
  test: {
    include: ["test/**/*.test.ts"],
  },
});
