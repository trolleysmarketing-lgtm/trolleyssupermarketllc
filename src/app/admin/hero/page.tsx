"use client";

import { useState, useEffect, useRef } from "react";
import { getAdminHeaders } from "@/app/admin/layout";

type Stat = { value: string; label_en: string; label_ar: string } | null;

type Slide = {
  id: number;
  active: boolean;
  order: number;
  image: string;
  accent: string;
  ctaLink: string;
  ctaSecondaryLink: string | null;
  badge_en: string; title_en: string; subtitle_en: string;
  cta_en: string; ctaSecondaryLabel_en: string;
  badge_ar: string; title_ar: string; subtitle_ar: string;
  cta_ar: string; ctaSecondaryLabel_ar: string;
  stat: Stat;
};

const empty = (): Slide => ({
  id: Date.now(),
  active: true,
  order: 99,
  image: "",
  accent: "#1C75BC",
  ctaLink: "/offers",
  ctaSecondaryLink: null,
  badge_en: "", title_en: "", subtitle_en: "",
  cta_en: "Browse Catalog", ctaSecondaryLabel_en: "Our Stores",
  badge_ar: "", title_ar: "", subtitle_ar: "",
  cta_ar: "تصفح الكتالوج", ctaSecondaryLabel_ar: "فروعنا",
  stat: null,
});

export default function AdminHeroPage() {
  const [slides, setSlides]   = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [tab, setTab]         = useState<"en" | "ar">("en");

  /* ── Upload state ── */
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError]         = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then(r => r.json())
      .then(d => { setSlides(d.slides || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (list: Slide[]) => {
    setSaving(true);
    await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ slides: list }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (id: number) => {
    const updated = slides.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSlides(updated);
    save(updated);
  };

  const remove = (id: number) => {
    if (!confirm("Delete this slide?")) return;
    const updated = slides.filter(s => s.id !== id);
    setSlides(updated);
    save(updated);
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const updated = [...slides];
    [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
    updated.forEach((s, idx) => s.order = idx + 1);
    setSlides(updated);
    save(updated);
  };

  const moveDown = (i: number) => {
    if (i === slides.length - 1) return;
    const updated = [...slides];
    [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
    updated.forEach((s, idx) => s.order = idx + 1);
    setSlides(updated);
    save(updated);
  };

  const openEdit = (slide: Slide) => { setEditing({ ...slide }); setTab("en"); setImgError(""); };
  const openNew  = () => { setEditing(empty()); setTab("en"); setImgError(""); };

  const saveEdit = () => {
    if (!editing) return;
    const exists = slides.find(s => s.id === editing.id);
    const updated = exists
      ? slides.map(s => s.id === editing.id ? editing : s)
      : [...slides, { ...editing, order: slides.length + 1 }];
    setSlides(updated);
    save(updated);
    setEditing(null);
  };

  /* ── Image upload handler ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError("");

    // Instant local preview
    const reader = new FileReader();
    reader.onload = ev => setEditing(p => p ? { ...p, image: ev.target?.result as string } : p);
    reader.readAsDataURL(file);

    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "hero-slider");

      const res = await fetch("/api/admin/save-cover", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.path || data.coverUrl || "";
        setEditing(p => p ? { ...p, image: url } : p);
      } else {
        setImgError("Upload failed. You can still paste a URL below.");
      }
    } catch {
      setImgError("Upload error. You can still paste a URL below.");
    } finally {
      setImgUploading(false);
    }
  };

  const field = (key: keyof Slide, label: string, multiline = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={(editing as any)[key] ?? ""}
          onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
          style={inp}
        />
      ) : (
        <input
          value={(editing as any)[key] ?? ""}
          onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
          style={inp}
        />
      )}
    </div>
  );

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Hero Slider</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Manage homepage hero slides — EN & AR</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved   && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Saved</span>}
          {saving  && <span style={{ fontSize: 13, color: "#94a3b8" }}>Saving...</span>}
          <button onClick={openNew} style={btnPrimary}>+ Add Slide</button>
        </div>
      </div>

      {/* Slides list */}
      {slides.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", background: "#f8fafc", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>No slides yet</p>
          <button onClick={openNew} style={btnPrimary}>Add First Slide</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slides.map((s, i) => (
            <div key={s.id} style={{
              background: "#fff", borderRadius: 14, border: `1.5px solid ${s.active ? "#e2e8f0" : "#fde8e8"}`,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
              opacity: s.active ? 1 : 0.6,
            }}>
              <div style={{ width: 80, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#e8f4fd" }}>
                {s.image ? (
                  <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🖼</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{s.title_en || "Untitled"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: s.active ? "#dcfce7" : "#fee2e2", color: s.active ? "#166534" : "#991b1b" }}>
                    {s.active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s.title_ar || "—"}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.ctaLink}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => moveUp(i)}   disabled={i === 0}                  style={iconBtn} title="Move up">↑</button>
                <button onClick={() => moveDown(i)} disabled={i === slides.length - 1}  style={iconBtn} title="Move down">↓</button>
                <button onClick={() => toggle(s.id)} style={{ ...iconBtn, color: s.active ? "#f59e0b" : "#22c55e" }} title={s.active ? "Hide" : "Show"}>
                  {s.active ? "👁" : "🚫"}
                </button>
                <button onClick={() => openEdit(s)} style={{ ...iconBtn, color: "#1C75BC" }} title="Edit">✏️</button>
                <button onClick={() => remove(s.id)} style={{ ...iconBtn, color: "#ef4444" }} title="Delete">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 620, maxHeight: "90vh", overflow: "auto", padding: 28 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                {slides.find(s => s.id === editing.id) ? "Edit Slide" : "New Slide"}
              </h2>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>

            {/* ── Cover image upload ── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Slide Image</label>

              {editing.image ? (
                /* Preview */
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <img
                    src={editing.image}
                    alt="Slide preview"
                    style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e2e8f0", display: "block" }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                  {imgUploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                      ⏳ Uploading…
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setEditing(p => p ? { ...p, image: "" } : p); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Remove image"
                  >✕</button>
                  {/* Change image button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >🔄 Change</button>
                </div>
              ) : (
                /* Upload zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed #d1d5db", borderRadius: 10, padding: "28px 16px",
                    textAlign: "center", cursor: "pointer", background: "#fafafa",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#1C75BC")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                >
                  {imgUploading ? (
                    <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>⏳ Uploading…</p>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                      <p style={{ margin: 0, fontSize: 14, color: "#374151", fontWeight: 600 }}>Click to upload slide image</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>JPG, PNG, WebP — recommended 1440×600px</p>
                    </>
                  )}
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />

              {imgError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>{imgError}</p>}

              {/* URL fallback */}
              {!editing.image && (
                <input
                  type="text"
                  value=""
                  onChange={e => setEditing(p => p ? { ...p, image: e.target.value } : p)}
                  style={{ ...inp, marginTop: 8 }}
                  placeholder="Or paste image URL (optional)"
                />
              )}
            </div>

            {/* CTA + Accent */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={lbl}>CTA Link</label>
                <input value={editing.ctaLink} onChange={e => setEditing(p => p ? { ...p, ctaLink: e.target.value } : p)} style={inp} placeholder="/offers" />
              </div>
              <div>
                <label style={lbl}>Accent Color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={editing.accent} onChange={e => setEditing(p => p ? { ...p, accent: e.target.value } : p)} style={{ width: 44, height: 36, borderRadius: 8, border: "1.5px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
                  <input value={editing.accent} onChange={e => setEditing(p => p ? { ...p, accent: e.target.value } : p)} style={{ ...inp, flex: 1 }} />
                </div>
              </div>
            </div>

            {/* Stat badge */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!editing.stat} onChange={e => setEditing(p => p ? { ...p, stat: e.target.checked ? { value: "", label_en: "", label_ar: "" } : null } : p)} />
                Show stat badge
              </label>
              {editing.stat && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                  <div><label style={lbl}>Value</label><input value={editing.stat.value} onChange={e => setEditing(p => p ? { ...p, stat: { ...p.stat!, value: e.target.value } } : p)} style={inp} placeholder="2h" /></div>
                  <div><label style={lbl}>Label EN</label><input value={editing.stat.label_en} onChange={e => setEditing(p => p ? { ...p, stat: { ...p.stat!, label_en: e.target.value } } : p)} style={inp} /></div>
                  <div><label style={lbl}>Label AR</label><input value={editing.stat.label_ar} onChange={e => setEditing(p => p ? { ...p, stat: { ...p.stat!, label_ar: e.target.value } } : p)} style={{ ...inp, direction: "rtl" }} /></div>
                </div>
              )}
            </div>

            {/* Lang tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
              {(["en", "ar"] as const).map(l => (
                <button key={l} onClick={() => setTab(l)} style={{
                  padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: "none", color: tab === l ? "#1C75BC" : "#94a3b8",
                  borderBottom: `2px solid ${tab === l ? "#1C75BC" : "transparent"}`,
                  marginBottom: -2,
                }}>
                  {l === "en" ? "🇬🇧 English" : "🇦🇪 Arabic"}
                </button>
              ))}
            </div>

            {tab === "en" ? (
              <div dir="ltr">
                {field("badge_en",            "Badge")}
                {field("title_en",            "Title (use \\n for line break)", true)}
                {field("subtitle_en",         "Subtitle", true)}
                {field("cta_en",              "CTA Button")}
                {field("ctaSecondaryLabel_en","Secondary Button")}
              </div>
            ) : (
              <div dir="rtl">
                {field("badge_ar",            "Badge")}
                {field("title_ar",            "Title (use \\n for line break)", true)}
                {field("subtitle_ar",         "Subtitle", true)}
                {field("cta_ar",              "CTA Button")}
                {field("ctaSecondaryLabel_ar","Secondary Button")}
              </div>
            )}

            {/* Active toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, marginBottom: 24 }}>
              <input type="checkbox" id="active-toggle" checked={editing.active}
                onChange={e => setEditing(p => p ? { ...p, active: e.target.checked } : p)} />
              <label htmlFor="active-toggle" style={{ fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                Show on website
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Cancel</button>
              <button onClick={saveEdit} disabled={imgUploading} style={{ ...btnPrimary, opacity: imgUploading ? 0.6 : 1, cursor: imgUploading ? "not-allowed" : "pointer" }}>
                {imgUploading ? "Uploading…" : "Save Slide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 };
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const btnPrimary: React.CSSProperties    = { padding: "10px 20px", borderRadius: 10, background: "#1C75BC", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const btnSecondary: React.CSSProperties  = { padding: "10px 20px", borderRadius: 10, background: "#f1f5f9", color: "#374151", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const iconBtn: React.CSSProperties       = { width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" };