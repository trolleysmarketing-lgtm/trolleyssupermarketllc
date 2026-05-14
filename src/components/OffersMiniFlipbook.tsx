"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const CatalogFlipbook = dynamic(() => import("@/components/CatalogFlipbook"), { ssr: false });

type Catalog = {
  id: string;
  title: string;
  filePath: string;
  validFrom: string;
  validTo: string;
};

export default function OffersMiniFlipbook({ locale }: { locale: string }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/latest-catalog")
      .then((r) => r.json())
      .then((d) => { setCatalog(d.catalog); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        height: isMobile ? 280 : 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.15)",
            borderTopColor: "#0e76bc",
            margin: "0 auto 14px",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif" }}>
            {locale === "ar" ? "جاري التحميل..." : "Loading catalog..."}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "40px 24px",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 16px", display: "block" }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
          {locale === "ar" ? "لا يوجد كتالوج حالياً" : "No catalog available yet"}
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>
          {locale === "ar" ? "تحقق قريباً من العروض الأسبوعية" : "Check back soon for weekly offers"}
        </p>
      </div>
    );
  }

 /* ── MOBILE: simple card ── */
if (isMobile) {
  return (
    <Link
      href={`/${locale}/offers`}
      style={{
        display: "block",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #e8e3dc",
        textDecoration: "none",
        background: "linear-gradient(135deg, #1C75BC 0%, #155a90 100%)",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 16px", display: "block" }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <p style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 6px", fontFamily: "'Outfit', sans-serif" }}>
        {catalog.title}
      </p>
      {catalog.validTo && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          {locale === "ar" ? "صالح حتى:" : "Valid until:"} {catalog.validTo}
        </p>
      )}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "white", color: "#1C75BC",
        padding: "11px 24px", borderRadius: 50,
        fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
        {locale === "ar" ? "عرض الكتالوج كاملاً" : "View Full Catalog"}
      </div>
    </Link>
  );
}

  /* ── DESKTOP: full flipbook ── */
  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
    }}>
      <CatalogFlipbook filePath={catalog.filePath} title={catalog.title} />
    </div>
  );
}