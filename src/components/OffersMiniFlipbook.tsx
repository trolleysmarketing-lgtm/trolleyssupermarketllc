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

  /* ── MOBILE: simple PDF viewer card ── */
  if (isMobile) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {/* PDF Preview — first page via embed */}
        <div style={{ position: "relative", width: "100%", paddingBottom: "141%" /* A4 ratio */ }}>
          <iframe
            src={`${catalog.filePath}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              background: "white",
              pointerEvents: "none",
            }}
            title={catalog.title}
          />
          {/* Tap overlay */}
          <Link
            href={`/${locale}/offers`}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 0 20px",
              textDecoration: "none",
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#0e76bc",
              color: "white",
              padding: "10px 20px",
              borderRadius: 50,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 13,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              {locale === "ar" ? "عرض الكتالوج كاملاً" : "View Full Catalog"}
            </div>
          </Link>
        </div>

        {/* Catalog info bar */}
        <div style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              {catalog.title}
            </p>
            {catalog.validTo && (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "2px 0 0", fontFamily: "'Outfit', sans-serif" }}>
                {locale === "ar" ? "صالح حتى:" : "Valid until:"} {catalog.validTo}
              </p>
            )}
          </div>
          
            <a href={catalog.filePath}
            download
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "rgba(255,255,255,0.8)",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF
          </a>
        </div>
      </div>
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