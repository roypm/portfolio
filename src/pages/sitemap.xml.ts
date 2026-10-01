import type { APIRoute } from "astro";

export const prerender = true;

const pages = [
  { locale: "es", url: "https://www.roypm.es/" },
  { locale: "en", url: "https://www.roypm.es/en/" },
  { locale: "ca", url: "https://www.roypm.es/ca/" },
] as const;

export const GET: APIRoute = () => {
  const entries = pages
    .map(
      ({ url }) => `  <url>
    <loc>${url}</loc>
${pages.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${alternate.url}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.roypm.es/" />
  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
