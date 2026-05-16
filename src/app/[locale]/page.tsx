// src/app/[locale]/page.tsx
// Server Component — no "use client"

import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import HeroSlider, { type Slide } from "@/components/HeroSlider";
import styles from "./homepage/homepage.module.css";
import CategoriesSection from "./homepage/CategoriesSection";
import TickerServer from "./homepage/TickerServer";

const OffersSection  = dynamic(() => import("./homepage/OffersSection"),  { ssr: false });
const ReviewsSection = dynamic(() => import("./homepage/ReviewsSection"), { ssr: false });
const BlogSection    = dynamic(() => import("./homepage/BlogSection"),    { ssr: false });
const StoresSection  = dynamic(() => import("./homepage/StoresSection"),  { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────
type HeroSlide = {
  id: number; active: boolean; order: number;
  image: string; accent: string; ctaLink: string; ctaSecondaryLink: string | null;
  badge_en: string; title_en: string; subtitle_en: string;
  cta_en: string; ctaSecondaryLabel_en: string;
  badge_ar: string; title_ar: string; subtitle_ar: string;
  cta_ar: string; ctaSecondaryLabel_ar: string;
  stat: { value: string; label_en: string; label_ar: string } | null;
};

type TickerItem = {
  id: number; text_en: string; text_ar: string; active: boolean;
};

// ── JSON-LD ──────────────────────────────────────────────────────────────────
function buildJsonLd(stores: Array<{ name: string; address: string; phone: string; city: string }>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GroceryStore",
        "@id": "https://www.trolleys.ae/#organization",
        name: "Trolleys Supermarket",
        url: "https://www.trolleys.ae",
        logo: { "@type": "ImageObject", url: "https://www.trolleys.ae/logo.png", width: 200, height: 60 },
        description: "Trolleys Supermarket — Fresh groceries, weekly offers, and fast delivery across Dubai, Sharjah, and Ajman, UAE.",
        areaServed: ["Dubai", "Sharjah", "Ajman"],
        priceRange: "$$",
        currenciesAccepted: "AED",
        paymentAccepted: "Cash, Credit Card, Debit Card",
        sameAs: ["https://www.instagram.com/trolleys.ae", "https://www.facebook.com/trolleys.ae"],
        location: stores.map((s) => ({
          "@type": "Store",
          name: `Trolleys ${s.name}`,
          address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressCountry: "AE" },
          telephone: s.phone,
        })),
      },
      {
        "@type": "WebSite",
        "@id": "https://www.trolleys.ae/#website",
        url: "https://www.trolleys.ae",
        name: "Trolleys Supermarket UAE",
        inLanguage: ["en", "ar"],
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: "https://www.trolleys.ae/en/search?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

// ── Server-side data fetching ─────────────────────────────────────────────────
async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/hero`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.slides ?? [];
  } catch { return []; }
}

async function getTickerItems(): Promise<TickerItem[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/ticker`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.items ?? [];
  } catch { return []; }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const isRTL = isAr;
  const t = await getTranslations({ locale, namespace: "home" });

  // Fetch data on server
  const [heroSlides, tickerItems] = await Promise.all([
    getHeroSlides(),
    getTickerItems(),
  ]);

  // Build slides
  const fallbackSlides: Slide[] = [
    {
      id: 1,
      badge: t("offers.subtitle"), title: t("offers.title"),
      subtitle: t("offers.description"), cta: t("offers.browseCatalog"),
      ctaLink: `/${locale}/offers`, image: "/hero-slider/trollyes-hero-slider-1.webp",
      accent: "#1C75BC",
    },
    {
      id: 2,
      badge: t("features.fastDelivery.title"), title: t("features.fastDelivery.title"),
      subtitle: t("features.fastDelivery.subtitle"), cta: t("offers.browseCatalog"),
      ctaLink: `/${locale}/delivery`, image: "/hero-slider/trollyes-hero-slider-2.webp",
      accent: "#DB2B2C", stat: { value: "2h", label: t("features.fastDelivery.title") },
    },
    {
      id: 3,
      badge: t("stores.subtitle"), title: t("stores.title"),
      subtitle: t("stores.titleHighlight"), cta: t("stores.viewAll"),
      ctaLink: `/${locale}/stores`, image: "/hero-slider/trollyes-hero-slider-3.webp",
      accent: "#c8956c", stat: { value: "5", label: t("stores.title") },
    },
  ];

  const active = heroSlides.filter(s => s.active).sort((a, b) => a.order - b.order);
  const slides: Slide[] = active.length === 0 ? fallbackSlides : active.map(s => ({
    id: s.id,
    badge:    isAr ? s.badge_ar    : s.badge_en,
    title:    isAr ? s.title_ar    : s.title_en,
    subtitle: isAr ? s.subtitle_ar : s.subtitle_en,
    cta:      isAr ? s.cta_ar      : s.cta_en,
    ctaLink:  `/${locale}${s.ctaLink}`,
    ctaSecondaryLabel: isAr ? s.ctaSecondaryLabel_ar : s.ctaSecondaryLabel_en,
    ctaSecondaryLink:  s.ctaSecondaryLink ? `/${locale}${s.ctaSecondaryLink}` : undefined,
    image: s.image, accent: s.accent,
    stat: s.stat ? { value: s.stat.value, label: isAr ? s.stat.label_ar : s.stat.label_en } : undefined,
  }));

  // Build ticker
  const fallbackTicker = [
    t("features.freshDaily.title"),
    t("features.weeklyOffers.title"),
    t("features.fastDelivery.title"),
    t("features.fourStores.title"),
    t("offers.subtitle"),
  ];

  const activeTickerItems = tickerItems
    .filter(i => i.active)
    .map(i => isAr ? i.text_ar : i.text_en);

  const tickerTexts = activeTickerItems.length > 0 ? activeTickerItems : fallbackTicker;

  const stores = t.raw("stores.list") as Array<{
    name: string; address: string; phone: string; city: string; hours: string; wa: string;
  }>;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(stores)) }}
      />
      <div className={styles.hp} dir={isRTL ? "rtl" : "ltr"} lang={locale}>
        <HeroSlider locale={locale} slides={slides} ariaLabel={t("offers.browseCatalog")} />
        <TickerServer items={tickerTexts} />
        <CategoriesSection locale={locale} isRTL={isRTL} />
        <OffersSection  locale={locale} isRTL={isRTL} />
        <ReviewsSection locale={locale} />
        <BlogSection    locale={locale} isRTL={isRTL} />
        <StoresSection  locale={locale} isRTL={isRTL} />
      </div>
    </>
  );
}