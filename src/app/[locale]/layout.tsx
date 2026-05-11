import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchemaOrg from "@/components/SchemaOrg";
import Chatbot from "@/components/Chatbot";
import Preloader from "@/components/Preloader";
import "../globals.css";
import { SurveyWidget } from "@/components/SurveyWidget";

const baseUrl = "https://trolleyssupermarketllc.com";

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

  return {
    metadataBase: new URL(baseUrl),

    title: {
      default: isAr
        ? "ترولييز سوبرماركت — دبي والشارقة وعجمان"
        : "Trolleys Supermarket UAE — Fresh Groceries, Weekly Offers | Dubai, Sharjah & Ajman",
      template: isAr
        ? "%s | ترولييز سوبرماركت الإمارات"
        : "%s | Trolleys Supermarket UAE",
    },

    description: isAr
      ? "ترولييز سوبرماركت في الإمارات — أطازج المنتجات وأفضل الأسعار. فروع في دبي والشارقة وعجمان. عروض أسبوعية، توصيل سريع، تسوق أونلاين."
      : "Trolleys Supermarket UAE — Fresh groceries, weekly catalog offers and fast delivery across Dubai, Sharjah and Ajman. Shop fresh produce, dairy, meat, bakery and more.",

    keywords: isAr
      ? [
          "ترولييز سوبرماركت",
          "سوبرماركت الإمارات",
          "سوبرماركت دبي",
          "سوبرماركت الشارقة",
          "سوبرماركت عجمان",
          "بقالة دبي",
          "توصيل بقالة الإمارات",
          "عروض أسبوعية الإمارات",
          "منتجات طازجة دبي",
          "سوبرماركت مردف",
          "سوبرماركت التعاون",
        ]
      : [
          "Trolleys Supermarket UAE",
          "supermarket Dubai",
          "supermarket Sharjah",
          "supermarket Ajman",
          "grocery store UAE",
          "fresh food Dubai",
          "weekly offers UAE",
          "grocery delivery Dubai",
          "supermarket Mirdif",
          "supermarket Al Taawun",
          "online grocery UAE",
          "best supermarket UAE",
        ],

    authors: [{ name: "Trolleys Supermarket LLC" }],
    creator: "Trolleys Supermarket LLC",
    publisher: "Trolleys Supermarket LLC",

    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "en": `${baseUrl}/en`,
        "ar": `${baseUrl}/ar`,
        "x-default": `${baseUrl}/en`,
      },
    },

    openGraph: {
      type: "website",
      locale: isAr ? "ar_AE" : "en_AE",
      alternateLocale: isAr ? "en_AE" : "ar_AE",
      url: `${baseUrl}/${locale}`,
      siteName: "Trolleys Supermarket",
      title: isAr
        ? "ترولييز سوبرماركت — دبي والشارقة وعجمان"
        : "Trolleys Supermarket UAE — Fresh Groceries & Weekly Offers",
      description: isAr
        ? "أطازج المنتجات وأفضل العروض الأسبوعية في الإمارات. فروع في دبي والشارقة وعجمان."
        : "Fresh groceries, weekly catalog offers and fast delivery across Dubai, Sharjah and Ajman.",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: isAr ? "ترولييز سوبرماركت الإمارات" : "Trolleys Supermarket UAE",
          type: "image/jpeg",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@trolleysuae",
      creator: "@trolleysuae",
      title: isAr
        ? "ترولييز سوبرماركت — دبي والشارقة وعجمان"
        : "Trolleys Supermarket UAE — Fresh Groceries & Weekly Offers",
      description: isAr
        ? "أطازج المنتجات وأفضل العروض الأسبوعية في الإمارات"
        : "Fresh groceries, weekly offers and fast delivery in UAE",
      images: [`${baseUrl}/og-image.jpg`],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    verification: {
      google: "GOOGLE_SEARCH_CONSOLE_TOKEN",
    },

    category: "shopping",

    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Trolleys",
    },

    other: {
      "geo.region": "AE-DU",
      "geo.placename": "Dubai, UAE",
      "geo.position": "25.2048;55.2708",
      "ICBM": "25.2048, 55.2708",
      "og:locale:alternate": isAr ? "en_AE" : "ar_AE",
      "business:contact_data:country_name": "United Arab Emirates",
      "business:contact_data:locality": "Dubai",
      "business:contact_data:region": "Dubai",
      "business:contact_data:website": baseUrl,
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

  return (
    <>
      <SchemaOrg locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <Preloader />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <SurveyWidget locale={locale} />
        <Chatbot />
        <Footer />
      </NextIntlClientProvider>
    </>
  );
}