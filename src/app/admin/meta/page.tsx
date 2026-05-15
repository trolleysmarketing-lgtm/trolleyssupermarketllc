"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type PageMeta = {
  title_en: string; title_ar: string;
  description_en: string; description_ar: string;
};

type MetaData = { pages: Record<string, PageMeta> };

const PAGE_LABELS: Record<string, { label: string; icon: string; path: string }> = {
  home:     { label: "Homepage",     icon: "🏠", path: "/" },
  about:    { label: "About Us",     icon: "ℹ️", path: "/about" },
  stores:   { label: "Stores",       icon: "🏪", path: "/stores" },
  offers:   { label: "Offers",       icon: "🎯", path: "/offers" },
  blog:     { label: "Blog",         icon: "📝", path: "/blog" },
  contact:  { label: "Contact",      icon: "📞", path: "/contact" },
  delivery: { label: "Delivery",     icon: "🚚", path: "/delivery" },
  faqs:     { label: "FAQs",         icon: "❓", path: "/faqs" },
};

const TITLE_LIMIT = 60;
const DESC_LIMIT  = 160;

function CharCount({ value, limit }: { value: string; limit: number }) {
  const len   = value.length;
  const color = len > limit ? "#ef4444" : len > limit * 0.85 ? "#f59e0b" : "#22c55e";
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600 }}>{len}/{limit}</span>
  );
}

export default function AdminMetaPage() {
  const [data,    setData]    = useState<MetaData>({ pages: {} });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [page,    setPage]    = useState("home");

  useEffect(() => {
    fetch("/api/admin/meta", { headers: getAdminHeaders() })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = (pageKey: string, field: keyof PageMeta, value: string) => {
    setData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: { ...prev.pages[pageKey], [field]: value },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const current = data.pages[page] || { title_en: "", title_ar: "", description_en: "", description_ar: "" };

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#64748b",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 5,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Meta Tags / SEO</p>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saved  && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: 13, color: "#94a3b8" }}>Saving...</span>}
          <button onClick={save} disabled={saving} style={{
            padding: "9px 20px", borderRadius: 8, background: "#1C75BC",
            color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Save Changes</button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "32px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", position: "sticky", top: 20 }}>
          {Object.entries(PAGE_LABELS).map(([key, info]) => (
            <button key={key} onClick={() => setPage(key)} style={{
              width: "100%", textAlign: "left", padding: "12px 16px",
              background: page === key ? "#eff6ff" : "transparent",
              border: "none", borderBottom: "1px solid #f9fafb",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{info.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: page === key ? 700 : 500, color: page === key ? "#1C75BC" : "#374151" }}>{info.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{info.path}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        {loading ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 40, textAlign: "center", color: "#94a3b8" }}>
            Loading...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Google preview */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Google Preview (EN)</p>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 18, color: "#1a0dab", margin: "0 0 2px", fontFamily: "arial, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {current.title_en || "Page Title"}
                </p>
                <p style={{ fontSize: 14, color: "#006621", margin: "0 0 4px", fontFamily: "arial, sans-serif" }}>
                  https://trolleyssupermarketllc.com/en/{page === "home" ? "" : page}
                </p>
                <p style={{ fontSize: 14, color: "#545454", margin: 0, fontFamily: "arial, sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {current.description_en || "Page description will appear here..."}
                </p>
              </div>
            </div>

            {/* EN fields */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🇬🇧</span> English
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lbl}>
                    <span>Page Title</span>
                    <CharCount value={current.title_en} limit={TITLE_LIMIT} />
                  </label>
                  <input
                    value={current.title_en}
                    onChange={e => update(page, "title_en", e.target.value)}
                    style={{ ...inp, borderColor: current.title_en.length > TITLE_LIMIT ? "#ef4444" : "#e5e7eb" }}
                    placeholder="Page Title — Trolleys Supermarket UAE"
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Recommended: 50-60 characters</p>
                </div>
                <div>
                  <label style={lbl}>
                    <span>Meta Description</span>
                    <CharCount value={current.description_en} limit={DESC_LIMIT} />
                  </label>
                  <textarea
                    value={current.description_en}
                    onChange={e => update(page, "description_en", e.target.value)}
                    rows={3}
                    style={{ ...inp, resize: "vertical", borderColor: current.description_en.length > DESC_LIMIT ? "#ef4444" : "#e5e7eb" }}
                    placeholder="Brief description of this page for search engines..."
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            {/* AR fields */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🇦🇪</span> Arabic
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }} dir="rtl">
                <div>
                  <label style={{ ...lbl, flexDirection: "row-reverse" }}>
                    <span>عنوان الصفحة</span>
                    <CharCount value={current.title_ar} limit={TITLE_LIMIT} />
                  </label>
                  <input
                    value={current.title_ar}
                    onChange={e => update(page, "title_ar", e.target.value)}
                    style={{ ...inp, textAlign: "right", borderColor: current.title_ar.length > TITLE_LIMIT ? "#ef4444" : "#e5e7eb" }}
                    placeholder="عنوان الصفحة — ترولييز سوبرماركت"
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", textAlign: "right" }}>الموصى به: 50-60 حرفاً</p>
                </div>
                <div>
                  <label style={{ ...lbl, flexDirection: "row-reverse" }}>
                    <span>وصف الصفحة</span>
                    <CharCount value={current.description_ar} limit={DESC_LIMIT} />
                  </label>
                  <textarea
                    value={current.description_ar}
                    onChange={e => update(page, "description_ar", e.target.value)}
                    rows={3}
                    style={{ ...inp, resize: "vertical", textAlign: "right", borderColor: current.description_ar.length > DESC_LIMIT ? "#ef4444" : "#e5e7eb" }}
                    placeholder="وصف موجز لهذه الصفحة لمحركات البحث..."
                  />
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", textAlign: "right" }}>الموصى به: 150-160 حرفاً</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}