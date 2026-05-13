"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
};

type Message = { type: "success" | "error"; text: string };

export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  /* ── Confirm dialog state ── */
  const [confirmOpen,    setConfirmOpen]    = useState(false);
  const [confirmSlug,    setConfirmSlug]    = useState<string>("");
  const [confirmTitle,   setConfirmTitle]   = useState<string>("");
  const [deleting,       setDeleting]       = useState(false);

  const emptyPost: BlogPost = {
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "News",
    excerpt: "",
    content: "",
  };

  const [form, setForm] = useState<BlogPost>(emptyPost);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts ?? []);
    }
    setLoading(false);
  };

  const showMessage = (msg: Message) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/blog", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      showMessage({ type: "success", text: editing ? "Post updated successfully!" : "Post published successfully!" });
      setForm(emptyPost);
      setEditing(null);
      fetchPosts();
    } else {
      showMessage({ type: "error", text: "Failed to save post. Please try again." });
    }
    setSaving(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditing(post);
    setForm(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Open confirm dialog ── */
  const askDelete = (post: BlogPost) => {
    setConfirmSlug(post.slug);
    setConfirmTitle(post.title);
    setConfirmOpen(true);
  };

  /* ── Confirmed delete ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: confirmSlug }),
      });
      if (res.ok) {
        showMessage({ type: "success", text: "Post deleted successfully." });
        fetchPosts();
      } else {
        showMessage({ type: "error", text: "Failed to delete post." });
      }
    } catch {
      showMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setConfirmSlug("");
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
    fontFamily: "inherit",
    background: "#fafafa",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#374151",
    display: "block" as const,
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${confirmTitle}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete Post"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmSlug(""); }}
      />

      {/* ── Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#1C75BC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Blog Posts</p>
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px" }}>

        {/* ── Global message ── */}
        {message && (
          <div style={{
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: "1px solid " + (message.type === "success" ? "#bbf7d0" : "#fecaca"),
            borderRadius: 12, padding: "12px 16px", fontSize: 14,
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
            fontWeight: 500,
          }}>
            <span>{message.type === "success" ? "✓" : "⚠"}</span>
            {message.text}
          </div>
        )}

        {/* ── Form ── */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111" }}>
            {editing ? "✏️ Edit Post" : "➕ New Blog Post"}
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  style={inputStyle}
                  placeholder="Post title"
                />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  required
                  style={inputStyle}
                  placeholder="post-url-slug"
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  <option>News</option>
                  <option>Health</option>
                  <option>Tips</option>
                  <option>Recipes</option>
                  <option>Offers</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  required
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Short description..."
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  required
                  rows={8}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Full article content..."
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? "#9ca3af" : "#1C75BC",
                  color: "white", border: "none", borderRadius: 10,
                  padding: "11px 24px", fontSize: 14, fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : editing ? "Update Post" : "Publish Post"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm(emptyPost); }}
                  style={{
                    background: "#f3f4f6", color: "#374151",
                    border: "1px solid #e5e7eb", borderRadius: 10,
                    padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Posts List ── */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111" }}>📝 Published Posts</h2>

          {loading ? (
            <p style={{ color: "#666", fontSize: 14 }}>Loading…</p>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
              <p style={{ fontSize: 14 }}>No posts yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.map(post => (
                <div
                  key={post.slug}
                  style={{
                    border: "1px solid #e5e7eb", borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{post.title}</p>
                      <span style={{ background: "#eff8ff", color: "#1C75BC", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
                        {post.category}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{post.date} · /{post.slug}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(post)}
                      style={{
                        background: "#eff6ff", color: "#2563eb",
                        border: "1px solid #bfdbfe", borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => askDelete(post)}
                      style={{
                        background: "#fef2f2", color: "#dc2626",
                        border: "1px solid #fecaca", borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
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