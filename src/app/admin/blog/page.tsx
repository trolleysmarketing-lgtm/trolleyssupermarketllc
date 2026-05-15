"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ConfirmDialog from "@/components/ConfirmDialog";

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage?: string;
};

type Message = { type: "success" | "error"; text: string };

export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  /* ── Cover image upload state ── */
  const [coverPreview,    setCoverPreview]    = useState<string>("");
  const [coverUploading,  setCoverUploading]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Confirm dialog state ── */
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [confirmSlug,  setConfirmSlug]  = useState<string>("");
  const [confirmTitle, setConfirmTitle] = useState<string>("");
  const [deleting,     setDeleting]     = useState(false);

  const emptyPost: BlogPost = {
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "News",
    excerpt: "",
    content: "",
    coverImage: "",
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

  /* ── Cover image upload ── */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");

      const res = await fetch("/api/admin/save-cover", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.path || data.coverUrl || "";
        setForm(prev => ({ ...prev, coverImage: url }));
        showMessage({ type: "success", text: "Cover image uploaded!" });
      } else {
        showMessage({ type: "error", text: "Image upload failed." });
        setCoverPreview("");
      }
    } catch {
      showMessage({ type: "error", text: "Upload error. Please try again." });
      setCoverPreview("");
    } finally {
      setCoverUploading(false);
    }
  };

  const removeCover = () => {
    setCoverPreview("");
    setForm(prev => ({ ...prev, coverImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setCoverPreview("");
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
    setCoverPreview(post.coverImage || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const askDelete = (post: BlogPost) => {
    setConfirmSlug(post.slug);
    setConfirmTitle(post.title);
    setConfirmOpen(true);
  };

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

        {/* ── Message ── */}
        {message && (
          <div style={{
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: "1px solid " + (message.type === "success" ? "#bbf7d0" : "#fecaca"),
            borderRadius: 12, padding: "12px 16px", fontSize: 14,
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontWeight: 500,
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

              {/* Title */}
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

              {/* Slug */}
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

              {/* Category */}
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

              {/* Date */}
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

              {/* Cover Image Upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Cover Image</label>

                {/* Preview */}
                {coverPreview ? (
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        width: "100%",
                        maxWidth: 420,
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1.5px solid #e5e7eb",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      style={{
                        position: "absolute",
                        top: 8, right: 8,
                        background: "rgba(0,0,0,0.55)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 28, height: 28,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                      }}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  /* Upload zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed #d1d5db",
                      borderRadius: 10,
                      padding: "28px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: coverUploading ? "#f9fafb" : "#fafafa",
                      transition: "border-color 0.2s",
                      marginBottom: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#1C75BC")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db")}
                  >
                    {coverUploading ? (
                      <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>⏳ Uploading…</p>
                    ) : (
                      <>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                        <p style={{ margin: 0, fontSize: 14, color: "#374151", fontWeight: 600 }}>Click to upload cover image</p>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>JPG, PNG, WebP — recommended 1200×630px</p>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: "none" }}
                />

                {/* Manual URL fallback */}
                {!coverPreview && (
                  <input
                    type="text"
                    value={form.coverImage || ""}
                    onChange={e => setForm({ ...form, coverImage: e.target.value })}
                    style={{ ...inputStyle, marginTop: 6 }}
                    placeholder="Or paste image URL (optional)"
                  />
                )}
              </div>

              {/* Excerpt */}
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

              {/* Content */}
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
                disabled={saving || coverUploading}
                style={{
                  background: (saving || coverUploading) ? "#9ca3af" : "#1C75BC",
                  color: "white", border: "none", borderRadius: 10,
                  padding: "11px 24px", fontSize: 14, fontWeight: 600,
                  cursor: (saving || coverUploading) ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : editing ? "Update Post" : "Publish Post"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm(emptyPost); setCoverPreview(""); }}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    {/* Thumbnail */}
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{
                          width: 56, height: 40,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #e5e7eb",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 56, height: 40, borderRadius: 6,
                        background: "#f3f4f6", border: "1px solid #e5e7eb",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0,
                      }}>🖼️</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{post.title}</p>
                        <span style={{ background: "#eff8ff", color: "#1C75BC", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
                          {post.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{post.date} · /{post.slug}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(post)}
                      style={{
                        background: "#eff6ff", color: "#2563eb",
                        border: "1px solid #bfdbfe", borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >✏️ Edit</button>
                    <button
                      onClick={() => askDelete(post)}
                      style={{
                        background: "#fef2f2", color: "#dc2626",
                        border: "1px solid #fecaca", borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >🗑️ Delete</button>
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