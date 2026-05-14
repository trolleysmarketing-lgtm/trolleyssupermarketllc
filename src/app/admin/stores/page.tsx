"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/app/admin/layout";

type Store = {
  name: string; city: string; address: string; phone: string;
  whatsapp: string; maps: string; hours: string;
  lat: number; lng: number; image: string;
};

const emptyStore = (): Store => ({
  name: "", city: "Dubai", address: "", phone: "",
  whatsapp: "", maps: "", hours: "7 AM - 2 AM (Daily)",
  lat: 25.2048, lng: 55.2708, image: "",
});

const cityColors: Record<string, string> = {
  Dubai: "#dbeafe", Sharjah: "#ede9fe", Ajman: "#ffedd5",
};

export default function AdminStoresPage() {
  const [stores,  setStores]  = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form,    setForm]    = useState<Store>(emptyStore());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stores");
    if (res.ok) { const d = await res.json(); setStores(d.stores || []); }
    setLoading(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImgPreview(base64);

      // Upload to server
      const ext = file.name.split(".").pop() || "jpg";
      const safeName = `${form.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "store"}-${Date.now()}.${ext}`;

      try {
        const res = await fetch("/api/admin/store-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAdminHeaders() },
          body: JSON.stringify({ base64, filename: safeName }),
        });
        const data = await res.json();
        if (data.path) {
          setForm(f => ({ ...f, image: data.path }));
          setMessage({ type: "success", text: "Image uploaded!" });
        }
      } catch {
        setMessage({ type: "error", text: "Image upload failed." });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage(null);

    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/stores", {
      method,
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage({ type: "success", text: editing ? "Store updated!" : "Store added!" });
      setForm(emptyStore()); setEditing(null); setImgPreview("");
      fetchStores();
    } else {
      setMessage({ type: "error", text: "Failed to save store." });
    }
    setSaving(false);
  };

  const handleEdit = (store: Store) => {
    setEditing(store);
    setForm(store);
    setImgPreview(store.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this store?")) return;
    await fetch("/api/admin/stores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ name }),
    });
    fetchStores();
  };

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
    padding: "9px 12px", fontSize: 14, boxSizing: "border-box", outline: "none",
  };
  const lbl: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#16a34a", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Stores</p>
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px" }}>

        {/* Form */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111" }}>
            {editing ? "✏️ Edit Store" : "➕ Add New Store"}
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Store Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inp} placeholder="Trolleys Al Khan" />
              </div>
              <div>
                <label style={lbl}>City</label>
                <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inp}>
                  <option>Dubai</option><option>Sharjah</option><option>Ajman</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required style={inp} placeholder="Full address" />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={inp} placeholder="+971 6 000 0000" />
              </div>
              <div>
                <label style={lbl}>WhatsApp Number</label>
                <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} required style={inp} placeholder="97160000000" />
              </div>
              <div>
                <label style={lbl}>Opening Hours</label>
                <input value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} required style={inp} placeholder="7 AM - 2 AM (Daily)" />
              </div>
              <div>
                <label style={lbl}>Google Maps URL</label>
                <input value={form.maps} onChange={e => setForm({ ...form, maps: e.target.value })} style={inp} placeholder="https://maps.google.com/..." />
              </div>
              <div>
                <label style={lbl}>Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={e => setForm({ ...form, lat: parseFloat(e.target.value) })} required style={inp} />
              </div>
              <div>
                <label style={lbl}>Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={e => setForm({ ...form, lng: parseFloat(e.target.value) })} required style={inp} />
              </div>

              {/* Image upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Store Photo</label>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {/* Preview */}
                  <div style={{
                    width: 160, height: 110, borderRadius: 10, overflow: "hidden",
                    border: "2px dashed #e5e7eb", background: "#f9fafb",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {(imgPreview || form.image) ? (
                      <img src={imgPreview || form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 32, opacity: 0.3 }}>🏪</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                      padding: "9px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                      background: "#f9fafb", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      color: "#374151", marginBottom: 8, display: "block",
                    }}>
                      {uploading ? "Uploading..." : "📷 Choose Photo"}
                    </button>
                    <div>
                      <label style={{ ...lbl, marginBottom: 4, fontSize: 11, color: "#9ca3af" }}>Or enter image path manually</label>
                      <input
                        value={form.image}
                        onChange={e => { setForm({ ...form, image: e.target.value }); setImgPreview(e.target.value); }}
                        style={{ ...inp, fontSize: 12 }}
                        placeholder="/store/my-store.webp"
                      />
                    </div>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0" }}>
                      Recommended: 800×600px, WebP or JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div style={{
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 13,
                color: message.type === "success" ? "#16a34a" : "#dc2626", marginBottom: 16,
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? "#9ca3af" : "linear-gradient(135deg,#16a34a,#15803d)",
                color: "white", border: "none", borderRadius: 10,
                padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
              }}>
                {saving ? "Saving..." : editing ? "Update Store" : "Add Store"}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(emptyStore()); setImgPreview(""); }} style={{
                  background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
                  borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Stores List */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111" }}>🏪 Active Stores</h2>

          {loading ? (
            <p style={{ color: "#666", fontSize: 14 }}>Loading...</p>
          ) : stores.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
              <p style={{ fontSize: 14 }}>No stores yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stores.map(store => (
                <div key={store.name} style={{
                  border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  {/* Thumb */}
                  <div style={{ width: 64, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                    {store.image ? (
                      <img src={store.image} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, opacity: 0.4 }}>🏪</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{store.name}</p>
                      <span style={{ background: cityColors[store.city] || "#f3f4f6", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: "#374151" }}>
                        {store.city}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>📍 {store.address}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>📞 {store.phone} · 🕐 {store.hours}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(store)} style={{
                      background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(store.name)} style={{
                      background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>🗑️ Delete</button>
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