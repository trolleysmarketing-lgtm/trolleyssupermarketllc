"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type TickerItem = {
  id: number;
  text_en: string;
  text_ar: string;
  active: boolean;
};

export default function AdminTickerPage() {
  const [items,   setItems]   = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [newEn,   setNewEn]   = useState("");
  const [newAr,   setNewAr]   = useState("");

  useEffect(() => {
    fetch("/api/admin/ticker")
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (list: TickerItem[]) => {
    setSaving(true);
    await fetch("/api/admin/ticker", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ items: list }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (id: number) => {
    const updated = items.map(i => i.id === id ? { ...i, active: !i.active } : i);
    setItems(updated);
    save(updated);
  };

  const remove = (id: number) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    save(updated);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...items];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setItems(updated);
    save(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const updated = [...items];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setItems(updated);
    save(updated);
  };

  const updateItem = (id: number, field: "text_en" | "text_ar", value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const saveEdit = (id: number) => {
    save(items);
  };

  const addItem = () => {
    if (!newEn.trim()) return;
    const newItem: TickerItem = {
      id: Date.now(),
      text_en: newEn.trim(),
      text_ar: newAr.trim() || newEn.trim(),
      active: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    save(updated);
    setNewEn("");
    setNewAr("");
  };

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Ticker / Marquee</p>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saved  && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: 13, color: "#94a3b8" }}>Saving...</span>}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "32px auto", padding: "0 24px" }}>

        {/* Preview */}
        <div style={{ background: "#1C75BC", borderRadius: 12, padding: "12px 0", overflow: "hidden", marginBottom: 28, position: "relative" }}>
          <p style={{ position: "absolute", top: 4, left: 12, fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Preview</p>
          <div style={{ display: "flex", gap: 0, whiteSpace: "nowrap", marginTop: 8 }}>
            {items.filter(i => i.active).map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)", flexShrink: 0 }}>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                {item.text_en}
              </span>
            ))}
          </div>
        </div>

        {/* Add new */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 16px" }}>➕ Add New Item</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>English</label>
              <input
                value={newEn}
                onChange={e => setNewEn(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()}
                style={inp}
                placeholder="Fresh Daily"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>Arabic (عربي)</label>
              <input
                value={newAr}
                onChange={e => setNewAr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()}
                style={{ ...inp, direction: "rtl", textAlign: "right" }}
                placeholder="طازج يومياً"
              />
            </div>
          </div>
          <button
            onClick={addItem}
            disabled={!newEn.trim()}
            style={{
              padding: "9px 20px", borderRadius: 8, background: newEn.trim() ? "#1C75BC" : "#e5e7eb",
              color: newEn.trim() ? "#fff" : "#9ca3af", border: "none", fontSize: 13,
              fontWeight: 600, cursor: newEn.trim() ? "pointer" : "not-allowed",
            }}
          >
            Add Item
          </button>
        </div>

        {/* Items list */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 16px" }}>
            📋 Ticker Items ({items.filter(i => i.active).length} active)
          </h3>

          {loading ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No items yet. Add one above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  border: `1.5px solid ${item.active ? "#e5e7eb" : "#fde8e8"}`,
                  borderRadius: 12, padding: "14px 16px",
                  background: item.active ? "#fff" : "#fef9f9",
                  opacity: item.active ? 1 : 0.7,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>EN</label>
                      <input
                        value={item.text_en}
                        onChange={e => updateItem(item.id, "text_en", e.target.value)}
                        onBlur={() => saveEdit(item.id)}
                        style={inp}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>AR</label>
                      <input
                        value={item.text_ar}
                        onChange={e => updateItem(item.id, "text_ar", e.target.value)}
                        onBlur={() => saveEdit(item.id)}
                        style={{ ...inp, direction: "rtl", textAlign: "right" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {/* Order buttons */}
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up"
                      style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13, opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                    <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1} title="Move down"
                      style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13, opacity: idx === items.length - 1 ? 0.4 : 1 }}>↓</button>

                    {/* Active toggle */}
                    <button onClick={() => toggle(item.id)}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                        background: item.active ? "#dcfce7" : "#fee2e2",
                        color: item.active ? "#166534" : "#991b1b" }}>
                      {item.active ? "● Active" : "○ Hidden"}
                    </button>

                    {/* Delete */}
                    <button onClick={() => remove(item.id)}
                      style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}