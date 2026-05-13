"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";


type Store = {
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  maps: string;
  hours: string;
  lat: number;
  lng: number;
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const emptyStore: Store = {
    name: "",
    city: "Dubai",
    address: "",
    phone: "",
    whatsapp: "",
    maps: "",
    hours: "7 AM - 2 AM (Daily)",
    lat: 25.2048,
    lng: 55.2708,
  };

  const [form, setForm] = useState<Store>(emptyStore);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stores");
    if (res.ok) {
      const data = await res.json();
      setStores(data.stores);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/stores", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage({ type: "success", text: editing ? "Store updated!" : "Store added!" });
      setForm(emptyStore);
      setEditing(null);
      fetchStores();
    } else {
      setMessage({ type: "error", text: "Failed to save store." });
    }
    setSaving(false);
  };

  const handleEdit = (store: Store) => {
    setEditing(store);
    setForm(store);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this store?")) return;
    const res = await fetch("/api/admin/stores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) fetchStores();
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#374151",
    display: "block" as const,
    marginBottom: 6,
  };

  const cityColors: Record<string, string> = {
    Dubai: "#dbeafe",
    Sharjah: "#ede9fe",
    Ajman: "#ffedd5",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

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
                <label style={labelStyle}>Store Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Trolleys Al Khan" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle}>
                  <option>Dubai</option>
                  <option>Sharjah</option>
                  <option>Ajman</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required style={inputStyle} placeholder="Full address" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required style={inputStyle} placeholder="+971 6 000 0000" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required style={inputStyle} placeholder="97160000000" />
              </div>
              <div>
                <label style={labelStyle}>Opening Hours</label>
                <input type="text" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required style={inputStyle} placeholder="7 AM - 2 AM (Daily)" />
              </div>
              <div>
                <label style={labelStyle}>Google Maps URL</label>
                <input type="text" value={form.maps} onChange={(e) => setForm({ ...form, maps: e.target.value })} style={inputStyle} placeholder="https://maps.google.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })} required style={inputStyle} />
              </div>
            </div>

            {message && (
              <div style={{
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: "1px solid " + (message.type === "success" ? "#bbf7d0" : "#fecaca"),
                borderRadius: 8, padding: "10px 14px", fontSize: 13,
                color: message.type === "success" ? "#16a34a" : "#dc2626",
                marginBottom: 16,
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
                {saving ? "Saving..." : editing ? "Update Store" : "Add Store"}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(emptyStore); }} style={{
                  background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
                  borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Cancel
                </button>
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
              {stores.map((store) => (
                <div key={store.name} style={{
                  border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{store.name}</p>
                      <span style={{
                        background: cityColors[store.city] || "#f3f4f6",
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: "#374151"
                      }}>
                        {store.city}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>📍 {store.address}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>📞 {store.phone} · 🕐 {store.hours}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEdit(store)} style={{
                      background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(store.name)} style={{
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