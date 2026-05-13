"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import HeroSlider from "@/components/HeroSlider";
import styles from "./homepage/homepage.module.css";

/* ── Above the fold — loaded immediately ── */
import CategoriesSection from "./homepage/CategoriesSection";

/* ── Below the fold — lazy loaded ── */
const OffersSection  = dynamic(() => import("./homepage/OffersSection"),  { ssr: false });
const ReviewsSection = dynamic(() => import("./homepage/ReviewsSection"), { ssr: false });
const BlogSection    = dynamic(() => import("./homepage/BlogSection"),    { ssr: false });
const StoresSection  = dynamic(() => import("./homepage/StoresSection"),  { ssr: false });

/* ── Structured Data ── */
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

/* ── Ticker ── */
function Ticker({ items }: { items: string[] }) {
  return (
    <div className={styles.ticker} aria-hidden="true" role="marquee">
      <div className={styles.tickerTrack}>
        {[...Array(2)].flatMap((_, pass) =>
          items.map((item, i) => (
            <span key={`${pass}-${i}`} className={styles.tickerItem}>
              <span className={styles.tickerSep} />
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function HomePage() {
  const params  = useParams();
  const locale  = (params?.locale as string) || "en";
  const isRTL   = locale === "ar";
  const t       = useTranslations("home");

  const stores = t.raw("stores.list") as Array<{
    name: string; address: string; phone: string;
    city: string; hours: string; wa: string;
  }>;

  const slides = [
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

  const tickerItems = [
    t("features.freshDaily.title"),
    t("features.weeklyOffers.title"),
    t("features.fastDelivery.title"),
    t("features.fourStores.title"),
    t("offers.subtitle"),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(stores)) }}
      />
      <div className={styles.hp} dir={isRTL ? "rtl" : "ltr"} lang={locale}>
        {/* ── Critical path ── */}
        <HeroSlider locale={locale} slides={slides} ariaLabel={t("offers.browseCatalog")} />
        <Ticker items={tickerItems} />
        <CategoriesSection locale={locale} isRTL={isRTL} />

        {/* ── Deferred ── */}
        <OffersSection  locale={locale} isRTL={isRTL} />
        <ReviewsSection locale={locale} />
        <BlogSection    locale={locale} isRTL={isRTL} />
        <StoresSection  locale={locale} isRTL={isRTL} />
      </div>
    </>
  );
}