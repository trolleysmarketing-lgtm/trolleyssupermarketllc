import { MetadataRoute } from "next";

const baseUrl = "https://trolleyssupermarketllc.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/admin",
          "/uploads/catalogs/",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "Anthropic-ai",
          "Claude-Web",
          "PerplexityBot",
          "cohere-ai",
        ],
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "/uploads/catalogs/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}