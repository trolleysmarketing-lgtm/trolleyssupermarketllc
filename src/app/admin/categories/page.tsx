"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";



type Category = {
  slug: string;
  name_en: string;
  name_ar: string;
  image: string;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: Category = {
  slug: "", name_en: "", name_ar: "",
  image: "", is_active: true, sort_order: 0,
};

const inputStyle = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
  padding: "9px 12px", fontSize: 14, boxSizing: "border-box" as const, outline: "none",
};
const labelStyle = {
  fontSize: 13, fontWeight: 600 as const, color: "#374151",
  display: "block" as const, marginBottom: 6,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [form, setForm]             = useState<Category>(EMPTY);
  const [message, setMessage]       = useState<{ type: "success" | "error"; text: string } | null>(null);
  const dragIdx                     = useRef<number | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
    setLoading(false);
  };

  /* ── Auto-generate slug from English name ── */
  const handleNameEn = (val: string) => {
    const slug = editing
      ? form.slug                                           // don't overwrite when editing
      : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm((f) => ({ ...f, name_en: val, slug }));
  };

  /* ── Save ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en || !form.name_ar || !form.slug) {
      setMessage({ type: "error", text: "Name (EN), Name (AR) and Slug are required." });
      return;
    }
    setSaving(true); setMessage(null);
    const res = await fetch("/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage({ type: "success", text: editing ? "Category updated!" : "Category added!" });
      setForm(EMPTY); setEditing(null);
      fetchCategories();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error ?? "Failed to save." });
    }
    setSaving(false);
  };

  /* ── Edit ── */
  const handleEdit = (cat: Category) => {
    setEditing(cat); setForm(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ── */
  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) fetchCategories();
  };

  /* ── Toggle active ── */
  const toggleActive = async (cat: Category) => {
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, is_active: !cat.is_active }),
    });
    fetchCategories();
  };

  /* ── Drag to reorder ── */
  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...categories];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setCategories(next);
  };
  const onDragEnd = async () => {
    dragIdx.current = null;
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: categories.map((c) => c.slug) }),
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#16a34a", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← Admin
        </Link>
        <span style={{ color: "#d1d5db" }}>/</span>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>Categories</h1>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Form ── */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111" }}>
            {editing ? "✏️ Edit Category" : "➕ Add New Category"}
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

              <div>
                <label style={labelStyle}>Name (English)</label>
                <input
                  value={form.name_en}
                  onChange={(e) => handleNameEn(e.target.value)}
                  required style={inputStyle} placeholder="Fresh Produce"
                />
              </div>

              <div>
                <label style={labelStyle}>Name (Arabic)</label>
                <input
                  value={form.name_ar} dir="rtl"
                  onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                  required style={inputStyle} placeholder="منتجات طازجة"
                />
              </div>

              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required style={{ ...inputStyle, fontFamily: "monospace" }}
                  placeholder="fresh-produce"
                />
              </div>

              <div>
                <label style={labelStyle}>Image path</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  style={inputStyle} placeholder="/categories/fresh_produce.webp"
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox" id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="is_active" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>
                  Active (visible on website)
                </label>
              </div>

            </div>

            {/* Image preview */}
            {form.image && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Preview</p>
                <img
                  src={form.image} alt="preview"
                  style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {message && (
              <div style={{
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: "1px solid " + (message.type === "success" ? "#bbf7d0" : "#fecaca"),
                borderRadius: 8, padding: "10px 14px", fontSize: 13,
                color: message.type === "success" ? "#16a34a" : "#dc2626", marginBottom: 16,
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? "#9ca3af" : "linear-gradient(135deg, #16a34a, #15803d)",
                color: "white", border: "none", borderRadius: 10,
                padding: "11px 24px", fontSize: 14, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}>
                {saving ? "Saving..." : editing ? "Update Category" : "Add Category"}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }} style={{
                  background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
                  borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── List ── */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111" }}>🗂️ All Categories</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Drag rows to reorder</p>
          </div>

          {loading ? (
            <p style={{ color: "#666", fontSize: 14 }}>Loading...</p>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🗂️</div>
              <p style={{ fontSize: 14 }}>No categories yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map((cat, i) => (
                <div
                  key={cat.slug}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDragEnd={onDragEnd}
                  style={{
                    border: "1px solid #e5e7eb", borderRadius: 12,
                    padding: "12px 16px", display: "flex",
                    alignItems: "center", gap: 14, cursor: "grab",
                    background: "#fff",
                    opacity: cat.is_active ? 1 : 0.55,
                  }}
                >
                  {/* Drag handle */}
                  <span style={{ color: "#d1d5db", fontSize: 18, flexShrink: 0 }}>⠿</span>

                  {/* Image */}
                  {cat.image ? (
                    <img
                      src={cat.image} alt={cat.name_en}
                      style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 60, borderRadius: 8, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8" }}>
                      No img
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{cat.name_en}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af", direction: "rtl", textAlign: "left" }}>{cat.name_ar}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#cbd5e1", fontFamily: "monospace" }}>{cat.slug}</p>
                  </div>

                  {/* Active badge */}
                  <button
                    onClick={() => toggleActive(cat)}
                    style={{
                      padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      border: "none", cursor: "pointer", flexShrink: 0,
                      background: cat.is_active ? "#dcfce7" : "#f1f5f9",
                      color: cat.is_active ? "#16a34a" : "#6b7280",
                    }}
                  >
                    {cat.is_active ? "Active" : "Hidden"}
                  </button>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(cat)} style={{
                      background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(cat.slug)} style={{
                      background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      🗑️ Delete
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