"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type Announcement = {
  active: boolean;
  dismissible: boolean;
  bg: string;
  textColor: string;
  text_en: string;
  text_ar: string;
  link_en: string;
  link_ar: string;
  link_label_en: string;
  link_label_ar: string;
};

const PRESET_COLORS = [
  { label: "Blue",   bg: "#1C75BC", text: "#ffffff" },
  { label: "Green",  bg: "#16a34a", text: "#ffffff" },
  { label: "Red",    bg: "#dc2626", text: "#ffffff" },
  { label: "Amber",  bg: "#d97706", text: "#ffffff" },
  { label: "Dark",   bg: "#0f172a", text: "#ffffff" },
  { label: "Gold",   bg: "#c8956c", text: "#ffffff" },
  { label: "Light",  bg: "#eff6ff", text: "#1C75BC" },
];

export default function AdminAnnouncementPage() {
  const [data,    setData]    = useState<Announcement>({
    active: false, dismissible: true,
    bg: "#1C75BC", textColor: "#ffffff",
    text_en: "", text_ar: "",
    link_en: "", link_ar: "",
    link_label_en: "View Offers →",
    link_label_ar: "عرض العروض ←",
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/announcement")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/announcement", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#64748b",
    display: "block", marginBottom: 5,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Announcement Banner</p>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saved  && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: 13, color: "#94a3b8" }}>Saving...</span>}
          <button onClick={save} disabled={saving} style={{
            padding: "9px 20px", borderRadius: 8, background: "#1C75BC",
            color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Save Changes
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Preview */}
        {data.text_en && (
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", padding: "8px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Preview (EN)
            </p>
            <div style={{
              background: data.bg, color: data.textColor,
              padding: "10px 16px", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 12, fontSize: 13, fontWeight: 500,
              position: "relative",
            }}>
              <span>{data.text_en}</span>
              {data.link_en && data.link_label_en && (
                <span style={{ fontWeight: 700, textDecoration: "underline", opacity: 0.9 }}>
                  {data.link_label_en}
                </span>
              )}
              {data.dismissible && (
                <span style={{ position: "absolute", right: 12, opacity: 0.7, fontSize: 16 }}>✕</span>
              )}
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>Banner Status</p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Toggle to show or hide the announcement on the website</p>
            </div>
            <button
              onClick={() => setData(d => ({ ...d, active: !d.active }))}
              style={{
                width: 52, height: 28, borderRadius: 999, border: "none", cursor: "pointer",
                background: data.active ? "#1C75BC" : "#e5e7eb",
                position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 3,
                left: data.active ? 27 : 3,
                width: 22, height: 22, borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 18px" }}>Message Content</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>🇬🇧 English Message</label>
              <input value={data.text_en} onChange={e => setData(d => ({ ...d, text_en: e.target.value }))} style={inp} placeholder="🎉 This week's special offers are live!" />
            </div>
            <div>
              <label style={lbl}>🇦🇪 Arabic Message</label>
              <input value={data.text_ar} onChange={e => setData(d => ({ ...d, text_ar: e.target.value }))} style={{ ...inp, direction: "rtl", textAlign: "right" }} placeholder="🎉 عروض هذا الأسبوع متاحة الآن!" />
            </div>
          </div>
        </div>

        {/* Link */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 18px" }}>Call to Action (optional)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>Link URL (EN)</label>
              <input value={data.link_en} onChange={e => setData(d => ({ ...d, link_en: e.target.value }))} style={inp} placeholder="/en/offers" />
            </div>
            <div>
              <label style={lbl}>Button Label (EN)</label>
              <input value={data.link_label_en} onChange={e => setData(d => ({ ...d, link_label_en: e.target.value }))} style={inp} placeholder="View Offers →" />
            </div>
            <div>
              <label style={lbl}>Link URL (AR)</label>
              <input value={data.link_ar} onChange={e => setData(d => ({ ...d, link_ar: e.target.value }))} style={inp} placeholder="/ar/offers" />
            </div>
            <div>
              <label style={lbl}>Button Label (AR)</label>
              <input value={data.link_label_ar} onChange={e => setData(d => ({ ...d, link_label_ar: e.target.value }))} style={{ ...inp, direction: "rtl", textAlign: "right" }} placeholder="عرض العروض ←" />
            </div>
          </div>
        </div>

        {/* Style */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 18px" }}>Appearance</h3>

          {/* Preset colors */}
          <label style={{ ...lbl, marginBottom: 10 }}>Color Preset</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {PRESET_COLORS.map(preset => (
              <button
                key={preset.label}
                onClick={() => setData(d => ({ ...d, bg: preset.bg, textColor: preset.text }))}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: `2px solid ${data.bg === preset.bg ? "#1C75BC" : "#e5e7eb"}`,
                  background: preset.bg, color: preset.text, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom color */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={lbl}>Background Color</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={data.bg} onChange={e => setData(d => ({ ...d, bg: e.target.value }))}
                  style={{ width: 44, height: 36, borderRadius: 8, border: "1.5px solid #e5e7eb", cursor: "pointer", padding: 2 }} />
                <input value={data.bg} onChange={e => setData(d => ({ ...d, bg: e.target.value }))} style={{ ...inp, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Text Color</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={data.textColor} onChange={e => setData(d => ({ ...d, textColor: e.target.value }))}
                  style={{ width: 44, height: 36, borderRadius: 8, border: "1.5px solid #e5e7eb", cursor: "pointer", padding: 2 }} />
                <input value={data.textColor} onChange={e => setData(d => ({ ...d, textColor: e.target.value }))} style={{ ...inp, flex: 1 }} />
              </div>
            </div>
          </div>

          {/* Dismissible */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={data.dismissible}
              onChange={e => setData(d => ({ ...d, dismissible: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
              Show close (✕) button — users can dismiss the banner
            </span>
          </label>
        </div>

        <button onClick={save} disabled={saving} style={{
          padding: "13px", borderRadius: 10, background: "#1C75BC",
          color: "#fff", border: "none", fontSize: 14, fontWeight: 600,
          cursor: "pointer", width: "100%",
        }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}