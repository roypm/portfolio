// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://www.roypm.es",
  trailingSlash: "always",
  i18n: {
    locales: ["es", "en", "ca"],
    defaultLocale: "es",
    fallback: {
      en: "es",
      ca: "es",
    },
    routing: {
      prefixDefaultLocale: false,
      fallbackType: "rewrite",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
});
