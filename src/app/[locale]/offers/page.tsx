// app/[locale]/offers/page.tsx
import OffersFlipbookWrapper from "@/components/OffersFlipbookWrapper";
import Breadcrumb from "@/components/Breadcrumb";
import { getTranslations } from "next-intl/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Metadata } from "next";

type Catalog = {
  id: string;
  title: string;
  filePath: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  active: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offers" });
  
  return {
    title: t("title"),
    description: t("hero_description"),
    openGraph: {
      title: t("hero_title_line1") + " — Trolleys Supermarket UAE",
      description: t("hero_description"),
      images: ["/offers/offers-og.webp"],
    },
  };
}

async function getLatestCatalog(): Promise<Catalog | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "offers.json");
    if (!existsSync(filePath)) return null;
    const raw = await readFile(filePath, "utf-8");
    const { catalogs } = JSON.parse(raw);
    return catalogs?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function OffersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const catalog = await getLatestCatalog();
  const isRTL = locale === "ar";
  
  // ✅ Server Component'te çeviri almanın doğru yolu
  const t = await getTranslations({ locale, namespace: "offers" });

  return (
    <>
      <style>{`
        .cp { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        
        .offers-info-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 900px;
          margin: 0 auto;
          padding: 36px clamp(16px, 3vw, 32px);
        }
        .offers-info-item {
          text-align: center;
          padding: 18px 14px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #f0ebe4;
        }
        .offers-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all .3s cubic-bezier(.25,.46,.45,.94);
          letter-spacing: .02em;
        }
        .offers-btn-primary {
          background: #c8956c;
          color: #fff;
          box-shadow: 0 4px 12px rgba(200,149,108,.2);
        }
        .offers-btn-primary:hover {
          background: #d4a87c;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(200,149,108,.3);
        }
        .offers-btn-outline {
          background: rgba(255,255,255,.03);
          border: 1.5px solid rgba(255,255,255,.12);
          color: #fff;
        }
        .offers-btn-outline:hover {
          background: rgba(255,255,255,.08);
          transform: translateY(-2px);
        }

        @keyframes pulse { 
          0%, 100% { opacity: .5; transform: scale(1); } 
          50% { opacity: 1; transform: scale(1.5); } 
        }

        @media(max-width: 640px) {
          .offers-info-bar { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <div className="cp" style={{ background: "#fdfbf9", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>
        
        {/* ✅ Standart Breadcrumb */}
        <Breadcrumb locale={locale} crumbs={[{ label: t("breadcrumb") }]} />

        {/* Page header */}
        <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)", position: "relative", overflow: "hidden", padding: "48px 32px 52px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", padding: "5px 14px", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffffff", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#ffffff" }}>
                {t("hero_badge")}
              </span>
            </div>
            <h1 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontStyle: "italic" , fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.02em" }}>
              {t("hero_title_line1")}{" "}
              <em style={{ color: "#ffffff", fontStyle: "italic" }}>{t("hero_title_line2")}</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", margin: 0 }}>
              {t("hero_description")}
            </p>
          </div>
        </div>

        {/* FLIPBOOK */}
        <OffersFlipbookWrapper catalog={catalog as any} locale={locale} />
        
        {/* INFO BAR */}
        <div style={{ background: "#fdfbf9" }}>
          <div className="offers-info-bar">
            {[
              {
                icon: "🔄",
                title: isRTL ? "تحديث أسبوعي" : "Updated Weekly",
                desc: isRTL ? "عروض جديدة كل أسبوع" : "Fresh deals every week",
              },
              {
                icon: "📱",
                title: isRTL ? "عبر واتساب" : "Via WhatsApp",
                desc: isRTL ? "تصلك العروض مباشرة" : "Offers sent directly to you",
              },
              {
                icon: "🆓",
                title: isRTL ? "مجاني بالكامل" : "100% Free",
                desc: isRTL ? "بدون رسوم اشتراك" : "No subscription fees",
              },
            ].map((item, i) => (
              <div key={i} className="offers-info-item">
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 11.5, color: "#7a7a7a", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </>
  );
}