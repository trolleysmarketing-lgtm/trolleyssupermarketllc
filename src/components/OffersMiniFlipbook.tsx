"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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

  useEffect(() => {
    fetch("/api/latest-catalog")
      .then((r) => r.json())
      .then((d) => { setCatalog(d.catalog); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        borderRadius: 16,
        height: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        border: "1px solid #e8e3dc",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #e2e8f0",
            borderTopColor: "#1C75BC",
            margin: "0 auto 14px",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
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
        borderRadius: 16,
        padding: "40px 24px",
        textAlign: "center",
        background: "#f8fafc",
        border: "1px solid #e8e3dc",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 16px", display: "block" }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
          {locale === "ar" ? "لا يوجد كتالوج حالياً" : "No catalog available yet"}
        </p>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          {locale === "ar" ? "تحقق قريباً من العروض الأسبوعية" : "Check back soon for weekly offers"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 20, overflow: "hidden" }}>
      <CatalogFlipbook filePath={catalog.filePath} title={catalog.title} />
    </div>
  );
}