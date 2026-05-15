"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type Flat = Record<string, string>;

// Group flat keys by top-level section
function groupKeys(flat: Flat): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const key of Object.keys(flat)) {
    const section = key.split(".")[0];
    if (!groups[section]) groups[section] = [];
    groups[section].push(key);
  }
  return groups;
}

const SECTION_LABELS: Record<string, string> = {
  nav:      "🧭 Navigation",
  home:     "🏠 Homepage",
  stores:   "🏪 Stores Page",
  about:    "ℹ️ About Page",
  offers:   "🎯 Offers Page",
  contact:  "📞 Contact Page",
  delivery: "🚚 Delivery Page",
  faqs:     "❓ FAQs Page",
  blog:     "📝 Blog",
  footer:   "🦶 Footer",
  privacy:  "🔒 Privacy Policy",
  terms:    "📄 Terms",
  cookies:  "🍪 Cookies",
};

export default function AdminTranslationsPage() {
  const [enFlat,   setEnFlat]   = useState<Flat>({});
  const [arFlat,   setArFlat]   = useState<Flat>({});
  const [changes,  setChanges]  = useState<{ en: Flat; ar: Flat }>({ en: {}, ar: {} });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [search,   setSearch]   = useState("");
  const [section,  setSection]  = useState("nav");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["nav"]));

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/translations?locale=en", { headers: getAdminHeaders() }).then(r => r.json()),
      fetch("/api/admin/translations?locale=ar", { headers: getAdminHeaders() }).then(r => r.json()),
    ]).then(([en, ar]) => {
      setEnFlat(en.flat || {});
      setArFlat(ar.flat || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (locale: "en" | "ar", key: string, value: string) => {
    if (locale === "en") setEnFlat(prev => ({ ...prev, [key]: value }));
    else                 setArFlat(prev => ({ ...prev, [key]: value }));
    setChanges(prev => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    const tasks = [];
    if (Object.keys(changes.en).length > 0) {
      tasks.push(fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ locale: "en", updates: changes.en }),
      }));
    }
    if (Object.keys(changes.ar).length > 0) {
      tasks.push(fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ locale: "ar", updates: changes.ar }),
      }));
    }
    await Promise.all(tasks);
    setChanges({ en: {}, ar: {} });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const groups   = groupKeys(enFlat);
  const sections = Object.keys(groups);
  const totalChanges = Object.keys(changes.en).length + Object.keys(changes.ar).length;

  // Filter keys by search
  const filteredKeys = useCallback((keys: string[]) => {
    if (!search) return keys;
    return keys.filter(k =>
      k.toLowerCase().includes(search.toLowerCase()) ||
      (enFlat[k] || "").toLowerCase().includes(search.toLowerCase()) ||
      (arFlat[k] || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, enFlat, arFlat]);

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 7,
    padding: "7px 10px", fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.5,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Translations</p>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {totalChanges > 0 && (
            <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, background: "#fef3c7", padding: "3px 10px", borderRadius: 999 }}>
              {totalChanges} unsaved changes
            </span>
          )}
          {saved  && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: 13, color: "#94a3b8" }}>Saving...</span>}
          <button onClick={save} disabled={saving || totalChanges === 0} style={{
            padding: "9px 20px", borderRadius: 8,
            background: totalChanges > 0 ? "#1C75BC" : "#e5e7eb",
            color: totalChanges > 0 ? "#fff" : "#9ca3af",
            border: "none", fontSize: 13, fontWeight: 600,
            cursor: totalChanges > 0 ? "pointer" : "not-allowed",
          }}>
            Save Changes
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", position: "sticky", top: 20 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys..."
              style={{ ...inp, fontSize: 12 }}
            />
          </div>
          <div>
            {sections.map(sec => {
              const keys = filteredKeys(groups[sec] || []);
              const hasChanges = keys.some(k => changes.en[k] || changes.ar[k]);
              return (
                <button key={sec} onClick={() => setSection(sec)} style={{
                  width: "100%", textAlign: "left", padding: "10px 16px",
                  background: section === sec ? "#eff6ff" : "transparent",
                  border: "none", borderBottom: "1px solid #f9fafb",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, fontWeight: section === sec ? 700 : 500, color: section === sec ? "#1C75BC" : "#374151" }}>
                    {SECTION_LABELS[sec] || sec}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>
                    {hasChanges ? <span style={{ color: "#f59e0b", fontWeight: 700 }}>●</span> : null}
                    {" "}{keys.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: 13 }}>Loading translations...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc", display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Key</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>🇬🇧</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>English</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>🇦🇪</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Arabic</span>
                </div>
              </div>

              {/* Rows */}
              <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                {(() => {
                  const keys = filteredKeys(groups[section] || []);
                  if (keys.length === 0) return (
                    <p style={{ padding: 24, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                      {search ? "No matching keys found." : "No keys in this section."}
                    </p>
                  );
                  return keys.map((key, i) => {
                    const shortKey = key.split(".").slice(1).join(".");
                    const enChanged = !!changes.en[key];
                    const arChanged = !!changes.ar[key];
                    const isLong = (enFlat[key] || "").length > 80;
                    return (
                      <div key={key} style={{
                        display: "grid", gridTemplateColumns: "200px 1fr 1fr",
                        gap: 12, padding: "10px 20px", alignItems: "start",
                        borderBottom: "1px solid #f9fafb",
                        background: i % 2 === 0 ? "#fff" : "#fafbff",
                      }}>
                        <div style={{ paddingTop: 6 }}>
                          <p style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", margin: 0, wordBreak: "break-all" }}>{shortKey}</p>
                        </div>
                        <div>
                          {isLong ? (
                            <textarea
                              value={enFlat[key] || ""}
                              onChange={e => handleChange("en", key, e.target.value)}
                              rows={3}
                              style={{ ...inp, resize: "vertical", borderColor: enChanged ? "#f59e0b" : "#e5e7eb" }}
                            />
                          ) : (
                            <input
                              value={enFlat[key] || ""}
                              onChange={e => handleChange("en", key, e.target.value)}
                              style={{ ...inp, borderColor: enChanged ? "#f59e0b" : "#e5e7eb" }}
                            />
                          )}
                        </div>
                        <div dir="rtl">
                          {isLong ? (
                            <textarea
                              value={arFlat[key] || ""}
                              onChange={e => handleChange("ar", key, e.target.value)}
                              rows={3}
                              style={{ ...inp, resize: "vertical", textAlign: "right", borderColor: arChanged ? "#f59e0b" : "#e5e7eb" }}
                            />
                          ) : (
                            <input
                              value={arFlat[key] || ""}
                              onChange={e => handleChange("ar", key, e.target.value)}
                              style={{ ...inp, textAlign: "right", borderColor: arChanged ? "#f59e0b" : "#e5e7eb" }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}