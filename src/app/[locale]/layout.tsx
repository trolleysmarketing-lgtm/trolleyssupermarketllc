import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchemaOrg from "@/components/SchemaOrg";
import Preloader from "@/components/Preloader";
import AnnouncementBar from "@/components/AnnouncementBar";
import "../globals.css";
import { LazyWidgets } from "@/components/LazyWidgets";
import { getPageMeta } from "@/lib/getPageMeta";

export const viewport: Viewport = {
  themeColor: "#0e76bc",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const meta = await getPageMeta("home", locale);

  return {
    ...meta,
    title: {
      default: meta.title,
      template: isAr ? "%s | ترولييز سوبرماركت الإمارات" : "%s | Trolleys Supermarket UAE",
    },
    keywords: isAr
      ? ["ترولييز سوبرماركت","سوبرماركت الإمارات","سوبرماركت دبي","سوبرماركت الشارقة","سوبرماركت عجمان","بقالة دبي","توصيل بقالة الإمارات","عروض أسبوعية الإمارات","منتجات طازجة دبي"]
      : ["Trolleys Supermarket UAE","supermarket Dubai","supermarket Sharjah","supermarket Ajman","grocery store UAE","fresh food Dubai","weekly offers UAE","grocery delivery Dubai"],
    authors: [{ name: "Trolleys Supermarket LLC" }],
    creator: "Trolleys Supermarket LLC",
    publisher: "Trolleys Supermarket LLC",
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    verification: { google: "GOOGLE_SEARCH_CONSOLE_TOKEN" },
    category: "shopping",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "Trolleys" },
    other: {
      "geo.region": "AE-DU", "geo.placename": "Dubai, UAE",
      "geo.position": "25.2048;55.2708", "ICBM": "25.2048, 55.2708",
      "og:locale:alternate": isAr ? "en_AE" : "ar_AE",
      "business:contact_data:country_name": "United Arab Emirates",
      "business:contact_data:locality": "Dubai",
      "business:contact_data:region": "Dubai",
      "business:contact_data:website": "https://trolleyssupermarketllc.com",
      "msapplication-TileColor": "#0e76bc",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isAr = locale === "ar";

  return (
    <html lang={locale} dir={isAr ? "rtl" : "ltr"}>
      <head>
        <meta name="theme-color" content="#0e76bc" />
        <meta name="msapplication-TileColor" content="#0e76bc" />
      </head>
      <body
        className="flex flex-col min-h-screen"
        style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}
      >
        <SchemaOrg locale={locale} />
        <NextIntlClientProvider messages={messages}>
          <Preloader />
          <AnnouncementBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <LazyWidgets locale={locale} />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}