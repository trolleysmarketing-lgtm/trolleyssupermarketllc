import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

const baseUrl = "https://trolleyssupermarketllc.com";

/* â”€â”€ Store data â”€â”€ */
type Store = {
  slug: string;
  name: string;
  name_ar: string;
  city: string;
  address: string;
  address_ar: string;
  phone: string;
  whatsapp: string;
  maps: string;
  hours: string;
  lat: number;
  lng: number;
  image: string;
  description: string;
  description_ar: string;
  keywords: string[];
};

const STORES: Store[] = [
  {
    slug: "mirdif-dubai",
    name: "Trolleys Supermarket Mirdif â€“ Dubai",
    name_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ù…Ø±Ø¯Ù â€“ Ø¯Ø¨ÙŠ",
    city: "Dubai",
    address: "Golden Gate Shopping Centre - Mirdif - Dubai - UAE",
    address_ar: "Ù…Ø±ÙƒØ² Ø¬ÙˆÙ„Ø¯Ù† Ø¬ÙŠØª Ø§Ù„ØªØ¬Ø§Ø±ÙŠ - Ù…Ø±Ø¯Ù - Ø¯Ø¨ÙŠ - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
    phone: "+971 4 232 2966",
    whatsapp: "971504986988",
    maps: "https://www.google.com/maps/place/?q=place_id:ChIJZQCb8PBhXz4R6WVzYGgrCbg",
    hours: "7 AM â€“ 2 AM (Daily)",
    lat: 25.2169,
    lng: 55.4175,
    image: "/store/Mirdif-Dubai.webp",
    description: "Trolleys Supermarket Mirdif is your neighbourhood grocery store in Golden Gate Shopping Centre, Dubai. Shop fresh produce, dairy, meat, bakery, and thousands of products at great prices.",
    description_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ù…Ø±Ø¯Ù Ù‡Ùˆ Ù…ØªØ¬Ø± Ø§Ù„Ø¨Ù‚Ø§Ù„Ø© Ø§Ù„Ù…Ø¬Ø§ÙˆØ± ÙÙŠ Ù…Ø±ÙƒØ² Ø¬ÙˆÙ„Ø¯Ù† Ø¬ÙŠØª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØŒ Ø¯Ø¨ÙŠ.",
    keywords: ["supermarket mirdif", "grocery store mirdif dubai", "trolleys mirdif", "fresh food mirdif"],
  },
  {
    slug: "al-taawun-sharjah",
    name: "Trolleys Supermarket Al Taawun â€“ Sharjah",
    name_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„ØªØ¹Ø§ÙˆÙ† â€“ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    city: "Sharjah",
    address: "895C+XXP - Al Khan - Sharjah - UAE",
    address_ar: "895C+XXP - Ø§Ù„Ø®Ø§Ù† - Ø§Ù„Ø´Ø§Ø±Ù‚Ø© - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
    phone: "+971 6 554 4505",
    whatsapp: "971504059699",
    maps: "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
    hours: "7 AM â€“ 3 AM (Daily)",
    lat: 25.3185,
    lng: 55.3890,
    image: "/store/Al-Taawun-Sharjah.webp",
    description: "Trolleys Supermarket Al Taawun is a leading grocery store in Sharjah, offering fresh produce, weekly deals, and a wide range of local and imported products.",
    description_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„ØªØ¹Ø§ÙˆÙ† Ù‡Ùˆ Ù…ØªØ¬Ø± Ø¨Ù‚Ø§Ù„Ø© Ø±Ø§Ø¦Ø¯ ÙÙŠ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©.",
    keywords: ["supermarket al taawun sharjah", "grocery sharjah", "trolleys sharjah", "supermarket sharjah"],
  },
  {
    slug: "al-khan-sharjah",
    name: "Trolleys Supermarket Al Khan â€“ Sharjah",
    name_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„Ø®Ø§Ù† â€“ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©",
    city: "Sharjah",
    address: "Al Khan Street - Al Khalidiya - Sharjah - UAE",
    address_ar: "Ø´Ø§Ø±Ø¹ Ø§Ù„Ø®Ø§Ù† - Ø§Ù„Ø®Ø§Ù„Ø¯ÙŠØ© - Ø§Ù„Ø´Ø§Ø±Ù‚Ø© - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
    phone: "+971 6 575 7010",
    whatsapp: "971547695919",
    maps: "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
    hours: "7 AM â€“ 2 AM (Daily)",
    lat: 25.3295,
    lng: 55.3894,
    image: "/store/Al-Khan-Sharjah.webp",
    description: "Trolleys Supermarket Al Khan serves the Al Khalidiya and Al Khan communities in Sharjah with fresh groceries, household products, and weekly offers.",
    description_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„Ø®Ø§Ù† ÙŠØ®Ø¯Ù… Ù…Ø¬ØªÙ…Ø¹Ø§Øª Ø§Ù„Ø®Ø§Ù„Ø¯ÙŠØ© ÙˆØ§Ù„Ø®Ø§Ù† ÙÙŠ Ø§Ù„Ø´Ø§Ø±Ù‚Ø©.",
    keywords: ["supermarket al khan sharjah", "grocery al khan", "trolleys al khan", "supermarket khalidiya sharjah"],
  },
  {
    slug: "al-nuaimiya-ajman",
    name: "Trolleys Supermarket Al Nuaimiya â€“ Ajman",
    name_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„Ù†Ø¹ÙŠÙ…ÙŠØ© â€“ Ø¹Ø¬Ù…Ø§Ù†",
    city: "Ajman",
    address: "Manama Market - Al Nuaimiya 1 - Ajman - UAE",
    address_ar: "Ø³ÙˆÙ‚ Ø§Ù„Ù…Ù†Ø§Ù…Ø© - Ø§Ù„Ù†Ø¹ÙŠÙ…ÙŠØ© 1 - Ø¹Ø¬Ù…Ø§Ù† - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
    phone: "+971 6 749 9919",
    whatsapp: "971563291296",
    maps: "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
    hours: "7 AM â€“ 2 AM (Daily)",
    lat: 25.4052,
    lng: 55.5136,
    image: "/store/Al-Nuaimia-Ajman.webp",
    description: "Trolleys Supermarket Al Nuaimiya in Ajman offers fresh produce, quality groceries, and great weekly deals for the Al Nuaimiya community.",
    description_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø§Ù„Ù†Ø¹ÙŠÙ…ÙŠØ© ÙÙŠ Ø¹Ø¬Ù…Ø§Ù† ÙŠÙ‚Ø¯Ù… Ù…Ù†ØªØ¬Ø§Øª Ø·Ø§Ø²Ø¬Ø© ÙˆØ¨Ù‚Ø§Ù„Ø© Ø¹Ø§Ù„ÙŠØ© Ø§Ù„Ø¬ÙˆØ¯Ø©.",
    keywords: ["supermarket ajman", "grocery ajman", "trolleys ajman", "supermarket al nuaimiya", "fresh food ajman"],
  },
  {
    slug: "oasis-street-ajman",
    name: "Trolleys Supermarket Oasis Street â€“ Ajman",
    name_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª Ø´Ø§Ø±Ø¹ Ø§Ù„ÙˆØ§Ø­Ø© â€“ Ø¹Ø¬Ù…Ø§Ù†",
    city: "Ajman",
    address: "Oasis Street - Al Nuaimia 1 - Ajman - UAE",
    address_ar: "Ø´Ø§Ø±Ø¹ Ø§Ù„ÙˆØ§Ø­Ø© - Ø§Ù„Ù†Ø¹ÙŠÙ…ÙŠØ© 1 - Ø¹Ø¬Ù…Ø§Ù† - Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",
    phone: "+971 50 790 4355",
    whatsapp: "971507904355",
    maps: "https://maps.google.com/?q=25.387256,55.458812",
    hours: "7 AM â€“ 3 AM (Daily)",
    lat: 25.38725635534364,
    lng: 55.45881250000001,
    image: "/store/oasis-ajman.webp",
    description: "Trolleys Supermarket on Oasis Street in Ajman is open late every day, offering a full range of groceries, fresh produce, and household essentials.",
    description_ar: "ØªØ±ÙˆÙ„ÙŠØ² Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª ÙÙŠ Ø´Ø§Ø±Ø¹ Ø§Ù„ÙˆØ§Ø­Ø© Ø¨Ø¹Ø¬Ù…Ø§Ù† Ù…ÙØªÙˆØ­ Ù…ØªØ£Ø®Ø±Ø§Ù‹ ÙƒÙ„ ÙŠÙˆÙ….",
    keywords: ["supermarket oasis street ajman", "grocery oasis ajman", "trolleys oasis ajman", "24 hour supermarket ajman"],
  },
];

export function getStoreBySlug(slug: string): Store | undefined {
  return STORES.find(s => s.slug === slug);
}

export function getAllStoreSlugs() {
  return STORES.map(s => s.slug);
}

/* â”€â”€ Metadata â”€â”€ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) return {};
  const isAr = locale === "ar";

  return {
    metadataBase: new URL(baseUrl),
    title: isAr ? store.name_ar : store.name,
    description: isAr ? store.description_ar : store.description,
    keywords: store.keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/stores/${slug}`,
      languages: {
        en: `${baseUrl}/en/stores/${slug}`,
        ar: `${baseUrl}/ar/stores/${slug}`,
      },
    },
    openGraph: {
      title: isAr ? store.name_ar : store.name,
      description: isAr ? store.description_ar : store.description,
      url: `${baseUrl}/${locale}/stores/${slug}`,
      images: [{ url: `${baseUrl}${store.image}`, width: 800, height: 600 }],
    },
  };
}

/* â”€â”€ Static params â”€â”€ */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  return locales.flatMap(locale =>
    STORES.map(store => ({ locale, slug: store.slug }))
  );
}

/* â”€â”€ Page â”€â”€ */
export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const store = getStoreBySlug(slug);
  if (!store) notFound();

  const t    = await getTranslations({ locale, namespace: "stores" });
  const isAr = locale === "ar";
  const name = isAr ? store.name_ar  : store.name;
  const addr = isAr ? store.address_ar : store.address;
  const desc = isAr ? store.description_ar : store.description;

  /* â”€â”€ LocalBusiness JSON-LD â”€â”€ */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: store.name,
    description: store.description,
    url: `${baseUrl}/en/stores/${store.slug}`,
    telephone: store.phone,
    image: `${baseUrl}${store.image}`,
    hasMap: store.maps,
    openingHours: "Mo-Su 07:00-02:00",
    currenciesAccepted: "AED",
    paymentAccepted: "Cash, Credit Card",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.lat,
      longitude: store.lng,
    },
    sameAs: [
      "https://www.instagram.com/trolleys.ae",
      "https://www.facebook.com/trolleys.ae",
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "Trolleys Supermarket LLC",
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        .store-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 32px;
        }
        .action-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .store-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .action-btns a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" }}>

        {/* â”€â”€ Breadcrumb â”€â”€ */}
        <Breadcrumb
          locale={locale}
          crumbs={[
            { label: isAr ? "ÙØ±ÙˆØ¹Ù†Ø§" : "Stores", href: `/${locale}/stores` },
            { label: name },
          ]}
        />

        {/* â”€â”€ Hero â”€â”€ */}
        <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)", position: "relative", overflow: "hidden", padding: "48px 32px 52px" }}>
          {/* Nokta desen */}
          <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          {/* Dekoratif daire */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          {/* MaÄŸaza resmi saÄŸda â€” sadece bÃ¼yÃ¼k ekranda */}
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "35%", overflow: "hidden", pointerEvents: "none" }}>
            <img
              src={store.image}
              alt=""
              aria-hidden="true"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #1C75BC 0%, transparent 60%)" }} />
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", padding: "5px 14px", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff" }}>
                {store.city} Â· UAE
              </span>
            </div>
            {/* BaÅŸlÄ±k */}
            <h1 className="serif" style={{ fontSize: "clamp(24px, 4vw, 44px)", fontStyle: "italic", fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.02em" }}>
              {name}
            </h1>
            {/* Adres */}
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: "0 0 6px", maxWidth: 500 }}>
              ðŸ“ {addr}
            </p>
            {/* Saat */}
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", margin: 0, maxWidth: 500 }}>
              ðŸ• {store.hours}
            </p>
          </div>
        </div>

        {/* â”€â”€ Content â”€â”€ */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px clamp(16px, 4vw, 48px)" }}>
          <div className="store-layout">

            {/* â”€â”€ Left â”€â”€ */}
            <div>
              <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, marginBottom: 32 }}>{desc}</p>

              {/* Info cards */}
              <div className="info-grid">
                {[
                  { icon: "ðŸ•", label: isAr ? "Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ø¹Ù…Ù„" : "Hours",   value: store.hours },
                  { icon: "ðŸ“ž", label: isAr ? "Ø§Ù„Ù‡Ø§ØªÙ"     : "Phone",   value: store.phone },
                  { icon: "ðŸ“", label: isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù†"    : "Address", value: addr },
                  { icon: "ðŸ™ï¸", label: isAr ? "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"    : "City",    value: store.city + ", UAE" },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "16px 18px",
                    border: "1px solid #e2e8f0",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" }}>
                      {icon} {label}
                    </p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="action-btns">
                <a href={`tel:${store.phone}`} style={actionBtn("#1C75BC", "#fff")}>
                  ðŸ“ž {isAr ? "Ø§ØªØµÙ„ Ø¨Ù†Ø§" : "Call Store"}
                </a>
                <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" style={actionBtn("#22c55e", "#fff")}>
                  ðŸ’¬ WhatsApp
                </a>
                <a href={store.maps} target="_blank" rel="noopener noreferrer" style={actionBtn("#0f172a", "#fff")}>
                  ðŸ—ºï¸ {isAr ? "Ø§Ù„Ø§ØªØ¬Ø§Ù‡Ø§Øª" : "Get Directions"}
                </a>
              </div>
            </div>

            {/* â”€â”€ Right: Other stores â”€â”€ */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                {isAr ? "ÙØ±ÙˆØ¹Ù†Ø§ Ø§Ù„Ø£Ø®Ø±Ù‰" : "Other Branches"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STORES.filter(s => s.slug !== slug).map(s => (
                  <Link key={s.slug} href={`/${locale}/stores/${s.slug}`} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    border: "1px solid #e2e8f0", background: "#fff",
                    textDecoration: "none",
                  }}>
                    <img
                      src={s.image}
                      alt={isAr ? s.name_ar : s.name}
                      style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isAr ? s.name_ar : s.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                        {s.city} Â· {s.hours}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href={`/${locale}/stores`} style={{
                display: "block", marginTop: 16, textAlign: "center",
                padding: "11px", borderRadius: 12,
                border: "1.5px solid #1C75BC",
                color: "#1C75BC", fontWeight: 600, fontSize: 13, textDecoration: "none",
              }}>
                {isAr ? "Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙØ±ÙˆØ¹" : "View All Stores"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const actionBtn = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 22px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  background: bg,
  color,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
});
