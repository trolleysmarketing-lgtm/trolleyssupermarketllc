import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

type PageMeta = {
  title_en: string; title_ar: string;
  description_en: string; description_ar: string;
};

type MetaData = { pages: Record<string, PageMeta> };

const baseUrl = "https://trolleyssupermarketllc.com";

export async function getPageMeta(pageKey: string, locale: string) {
  const isAr = locale === "ar";

  // Default fallbacks
  const defaults: Record<string, { en: { title: string; desc: string }; ar: { title: string; desc: string } }> = {
    home:     { en: { title: "Trolleys Supermarket UAE — Fresh Groceries, Weekly Offers | Dubai, Sharjah & Ajman", desc: "Trolleys Supermarket UAE — Fresh groceries, weekly catalog offers and fast delivery across Dubai, Sharjah and Ajman." }, ar: { title: "ترولييز سوبرماركت — دبي والشارقة وعجمان", desc: "ترولييز سوبرماركت في الإمارات — أطازج المنتجات وأفضل الأسعار. فروع في دبي والشارقة وعجمان." } },
    about:    { en: { title: "About Us — Trolleys Supermarket UAE", desc: "Learn about Trolleys Supermarket, your trusted grocery destination in Dubai, Sharjah and Ajman." }, ar: { title: "من نحن — ترولييز سوبرماركت", desc: "تعرف على ترولييز سوبرماركت، وجهتك الموثوقة للبقالة في دبي والشارقة وعجمان." } },
    stores:   { en: { title: "Our Stores — Trolleys Supermarket UAE", desc: "Find Trolleys Supermarket branches across Dubai, Sharjah and Ajman." }, ar: { title: "فروعنا — ترولييز سوبرماركت", desc: "اعثر على فروع ترولييز سوبرماركت في دبي والشارقة وعجمان." } },
    offers:   { en: { title: "Weekly Offers — Trolleys Supermarket UAE", desc: "Discover hundreds of products on sale every week at Trolleys Supermarket." }, ar: { title: "العروض الأسبوعية — ترولييز سوبرماركت", desc: "اكتشف مئات المنتجات المخفضة كل أسبوع في ترولييز سوبرماركت." } },
    blog:     { en: { title: "Blog — Trolleys Supermarket UAE", desc: "Read the latest articles on smart shopping and healthy lifestyle from Trolleys Supermarket." }, ar: { title: "المدونة — ترولييز سوبرماركت", desc: "اقرأ أحدث المقالات عن التسوق الذكي من ترولييز سوبرماركت." } },
    contact:  { en: { title: "Contact Us — Trolleys Supermarket UAE", desc: "Get in touch with Trolleys Supermarket. Find our phone numbers, WhatsApp and store locations." }, ar: { title: "اتصل بنا — ترولييز سوبرماركت", desc: "تواصل مع ترولييز سوبرماركت. اعثر على أرقام هواتفنا وواتساب ومواقع الفروع." } },
    delivery: { en: { title: "Delivery Information — Trolleys Supermarket UAE", desc: "Fast and reliable grocery delivery across Dubai, Sharjah and Ajman." }, ar: { title: "معلومات التوصيل — ترولييز سوبرماركت", desc: "توصيل بقالة سريع وموثوق في دبي والشارقة وعجمان." } },
    faqs:     { en: { title: "FAQs — Trolleys Supermarket UAE", desc: "Find answers to frequently asked questions about Trolleys Supermarket." }, ar: { title: "الأسئلة الشائعة — ترولييز سوبرماركت", desc: "اعثر على إجابات الأسئلة الشائعة حول ترولييز سوبرماركت." } },
  };

  let title       = defaults[pageKey]?.[isAr ? "ar" : "en"]?.title       || "Trolleys Supermarket UAE";
  let description = defaults[pageKey]?.[isAr ? "ar" : "en"]?.desc || "";

  // Try to read from data/meta.json
  try {
    const metaPath = path.join(process.cwd(), "data", "meta.json");
    if (existsSync(metaPath)) {
      const data: MetaData = JSON.parse(await readFile(metaPath, "utf-8"));
      const page = data.pages?.[pageKey];
      if (page) {
        if (isAr) {
          if (page.title_ar)       title       = page.title_ar;
          if (page.description_ar) description = page.description_ar;
        } else {
          if (page.title_en)       title       = page.title_en;
          if (page.description_en) description = page.description_en;
        }
      }
    }
  } catch { /* use defaults */ }

  const pagePath = pageKey === "home" ? `/${locale}` : `/${locale}/${pageKey}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}${pagePath}`,
      languages: {
        en: `${baseUrl}/en${pageKey === "home" ? "" : `/${pageKey}`}`,
        ar: `${baseUrl}/ar${pageKey === "home" ? "" : `/${pageKey}`}`,
        "x-default": `${baseUrl}/en${pageKey === "home" ? "" : `/${pageKey}`}`,
      },
    },
    openGraph: {
      type: "website" as const,
      locale: isAr ? "ar_AE" : "en_AE",
      url: `${baseUrl}${pagePath}`,
      siteName: "Trolleys Supermarket",
      title,
      description,
      images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630, alt: "Trolleys Supermarket UAE" }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}