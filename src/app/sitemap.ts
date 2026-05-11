import { MetadataRoute } from "next";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const baseUrl = "https://trolleyssupermarketllc.com";

const pages = [
  { path: "",           changeFreq: "daily"   as const, priority: 1.0  },
  { path: "/about",     changeFreq: "monthly" as const, priority: 0.8  },
  { path: "/stores",    changeFreq: "weekly"  as const, priority: 0.9  },
  { path: "/offers",    changeFreq: "daily"   as const, priority: 0.95 },
  { path: "/blog",      changeFreq: "daily"   as const, priority: 0.85 },
  { path: "/contact",   changeFreq: "monthly" as const, priority: 0.7  },
  { path: "/delivery",  changeFreq: "monthly" as const, priority: 0.8  },
  { path: "/faqs",      changeFreq: "monthly" as const, priority: 0.6  },
  { path: "/privacy",   changeFreq: "yearly"  as const, priority: 0.3  },
  { path: "/terms",     changeFreq: "yearly"  as const, priority: 0.3  },
  { path: "/cookies",   changeFreq: "yearly"  as const, priority: 0.3  },
];

const storeSlugs = [
  "mirdif-dubai",
  "al-taawun-sharjah",
  "al-khan-sharjah",
  "al-nuaimiya-ajman",
  "oasis-street-ajman",
];

async function getBlogSlugs(): Promise<string[]> {
  try {
    const dataPath = path.join(process.cwd(), "data", "blog.json");
    if (!existsSync(dataPath)) return [];
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return (data.posts || []).map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales    = ["en", "ar"];
  const blogSlugs  = await getBlogSlugs();

  const pageUrls = pages.flatMap(({ path: p, changeFreq, priority }) =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${p}`,
          ar: `${baseUrl}/ar${p}`,
        },
      },
    }))
  );

  // Individual store pages — high priority for local SEO
  const storeUrls = storeSlugs.flatMap(slug =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/stores/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
      alternates: {
        languages: {
          en: `${baseUrl}/en/stores/${slug}`,
          ar: `${baseUrl}/ar/stores/${slug}`,
        },
      },
    }))
  );

  const blogUrls = blogSlugs.flatMap(slug =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/en/blog/${slug}`,
          ar: `${baseUrl}/ar/blog/${slug}`,
        },
      },
    }))
  );

  return [...pageUrls, ...storeUrls, ...blogUrls];
}