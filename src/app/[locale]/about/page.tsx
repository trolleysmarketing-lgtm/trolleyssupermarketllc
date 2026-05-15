// app/[locale]/about/page.tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";
import { getPageMeta } from "@/lib/getPageMeta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMeta("about", locale);
}

function getOrganizationSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Trolleys Supermarket",
    url: `https://trolleys.ae/${locale}`,
    logo: "https://trolleys.ae/logo.webp",
    description: locale === "ar"
      ? "تروليز سوبرماركت - وجهتك المفضلة للتسوق في الإمارات العربية المتحدة"
      : "Trolleys Supermarket - Your favorite shopping destination in the UAE",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sharjah",
      addressCountry: "AE",
    },
    sameAs: [
      "https://www.instagram.com/trolleysuae",
      "https://www.facebook.com/trolleysuae",
    ],
  };
}

function getBreadcrumbSchema(locale: string, t: any) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trolleys", item: `https://trolleys.ae/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb"), item: `https://trolleys.ae/${locale}/about` },
    ],
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const isRTL = locale === "ar";

  const values = [
    { icon: "🥬", title: t("value_1_title"), text: t("value_1_text") },
    { icon: "🤝", title: t("value_2_title"), text: t("value_2_text") },
    { icon: "💎", title: t("value_3_title"), text: t("value_3_text") },
    { icon: "⭐", title: t("value_4_title"), text: t("value_4_text") },
  ];

  const branches = [
    { name: t("branch_1_name"), city: t("branch_1_city"), hours: "7AM – 3AM", url: "al-taawun", color: "#DB2B2C" },
    { name: t("branch_2_name"), city: t("branch_2_city"), hours: "7AM – 2AM", url: "al-khan", color: "#DB2B2C" },
    { name: t("branch_3_name"), city: t("branch_3_city"), hours: "7AM – 2AM", url: "mirdif", color: "#1C75BC" },
    { name: t("branch_4_name"), city: t("branch_4_city"), hours: "7AM – 2AM", url: "al-nuaimia", color: "#DB2B2C" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema(locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(locale, t)) }} />

      <style>{`
        .cp { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        .about-card {
          transition: all .3s cubic-bezier(.25,.46,.45,.94);
        }
        .about-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,.05);
        }
        @keyframes pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-card { transition: none !important; }
          .about-card:hover { transform: none !important; }
        }
        @media(max-width: 768px) {
          .about-values-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width: 480px) {
          .about-values-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="cp" style={{ minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>
        <Breadcrumb locale={locale} crumbs={[{ label: t("breadcrumb") }]} />

        {/* HERO */}
        <header style={{
          background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)",
          position: "relative", overflow: "hidden", padding: "48px 32px 52px"
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, opacity: .02,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px", pointerEvents: "none"
          }} />
          <div aria-hidden="true" style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)", pointerEvents: "none"
          }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
              padding: "5px 14px", borderRadius: 999, marginBottom: 16
            }}>
              <span aria-hidden="true" style={{
                width: 5, height: 5, borderRadius: "50%", background: "#ffffff",
                animation: "pulse 2s ease-in-out infinite"
              }} />
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: ".12em",
                textTransform: "uppercase", color: "#ffffff"
              }}>{t("hero_badge")}</span>
            </div>
            <h1 className="serif" style={{
              fontSize: "clamp(28px,4vw,44px)", fontStyle: "italic", fontWeight: 400,
              color: "#fff", margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.02em"
            }}>
              {t("hero_title_line1")}{" "}
              <em style={{ color: "#ffffff", fontStyle: "italic" }}>{t("hero_title_line2")}</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", margin: 0, maxWidth: 600 }}>
              {t("hero_description")}
            </p>
          </div>
        </header>

        {/* STORY */}
        <section aria-labelledby="story-heading" style={{
          padding: "80px 0",
          background: "linear-gradient(135deg, rgba(28,117,188,.04) 0%, rgba(255,255,255,.5) 100%)",
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: "#1C75BC", marginBottom: 14
              }}>
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
                {t("story_badge")}
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
              </span>
              <h2 id="story-heading" className="serif" style={{
                fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.2, marginBottom: 16
              }}>
                {t("story_title")}
              </h2>
              <p style={{ fontSize: 14, color: "#7a7a7a", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
                {t("story_text")}
              </p>
            </div>
            <figure style={{
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,.06)", border: "1px solid #f0ebe4", margin: 0
            }}>
              <img src="/about/trolleys-store-front.webp" alt={t("hero_badge")}
                width={800} height={400} loading="lazy"
                style={{ width: "100%", height: "auto", display: "block" }} />
            </figure>
          </div>
        </section>

        {/* VALUES */}
        <section aria-labelledby="values-heading" style={{ padding: "80px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: "#1C75BC", marginBottom: 14
              }}>
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
                {t("values_badge")}
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
              </span>
              <h2 id="values-heading" className="serif" style={{
                fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.2
              }}>
                {t("values_title")}
              </h2>
            </div>
            <div className="about-values-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {values.map((item, i) => (
                <article key={i} className="about-card" style={{
                  background: "#fff", borderRadius: 14, padding: "28px 20px",
                  border: "1px solid #f0ebe4", textAlign: "center"
                }}>
                  <div aria-hidden="true" style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 12, color: "#7a7a7a", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* BRANCHES */}
        <section aria-labelledby="branches-heading" style={{
          padding: "80px 0",
          background: "linear-gradient(135deg, rgba(28,117,188,.04) 0%, rgba(255,255,255,.5) 100%)",
        }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: "#1C75BC", marginBottom: 14
              }}>
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
                {t("branches_badge")}
                <span aria-hidden="true" style={{ width: 20, height: 1, background: "#1C75BC", opacity: .4 }} />
              </span>
              <h2 id="branches-heading" className="serif" style={{
                fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.2
              }}>
                {t("branches_title")}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              {branches.map((branch, i) => (
                <article key={i} className="about-card" style={{
                  background: "#fff", borderRadius: 12, padding: "20px",
                  border: "1px solid #f0ebe4", textAlign: "center"
                }}>
                  <div aria-hidden="true" style={{
                    width: 40, height: 40, borderRadius: 10, background: "#e8f4fd",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{branch.name}</h3>
                  <address style={{ fontSize: 11, color: "#a0a0a0", marginBottom: 8, fontStyle: "normal" }}>{branch.city}</address>
                  <time style={{
                    fontSize: 10, fontWeight: 600, color: "#1C75BC",
                    background: "#e8f4fd", padding: "3px 10px", borderRadius: 999, display: "inline-block"
                  }}>{branch.hours}</time>
                </article>
              ))}
            </div>
            <nav aria-label={t("view_all_stores")} style={{ textAlign: "center", marginTop: 32 }}>
              <Link href={`/${locale}/stores`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 999,
                background: "#1C75BC", color: "#fff",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                transition: "all .3s", boxShadow: "0 4px 12px rgba(28,117,188,.25)"
              }}>
                {t("view_all_stores")}
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </nav>
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-heading" style={{
          padding: "72px 0",
          background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)",
          position: "relative", overflow: "hidden"
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,149,108,.08) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />
          <div style={{
            maxWidth: 500, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)",
            textAlign: "center", position: "relative", zIndex: 1
          }}>
            <h2 id="cta-heading" className="serif" style={{
              fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400,
              color: "#fff", lineHeight: 1.15, marginBottom: 12
            }}>{t("cta_title")}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", marginBottom: 28, lineHeight: 1.7 }}>
              {t("cta_description")}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={`/${locale}/stores`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 999,
                background: "#ffffff", color: "#1C75BC",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,.1)", transition: "all .3s"
              }}>
                {t("cta_button_stores")}
              </Link>
              <Link href={`/${locale}/offers`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 999,
                background: "rgba(255,255,255,.03)",
                border: "1.5px solid rgba(255,255,255,.1)",
                color: "#fff", fontSize: 13, fontWeight: 600,
                textDecoration: "none", transition: "all .3s"
              }}>
                {t("cta_button_offers")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}