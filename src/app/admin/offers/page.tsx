"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";

type Catalog = {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  shortLink: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  active: boolean;
};

export default function AdminOffersPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [blogResults, setBlogResults] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Catalog | null>(null);

  useEffect(() => { fetchCatalogs(); }, []);

  const fetchCatalogs = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/catalogs");
    if (res.ok) {
      const data = await res.json();
      setCatalogs(data.catalogs);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", title);
    formData.append("validFrom", validFrom);
    formData.append("validTo", validTo);
    const res = await fetch("/api/admin/upload-pdf", { method: "POST", body: formData });
    if (res.ok) {
      setMessage({ type: "success", text: "Catalog uploaded successfully!" });
      setTitle(""); setValidFrom(""); setValidTo(""); setFile(null);
      fetchCatalogs();
    } else {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    }
    setUploading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch("/api/admin/delete-catalog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: `"${deleteTarget.title}" deleted successfully.` });
      fetchCatalogs();
    } else {
      setMessage({ type: "error", text: "Delete failed. Please try again." });
    }
    setDeleteTarget(null);
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/en/offers/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Client-side PDF → cover image via pdfjs
  const extractCover = async (filePath: string): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument(filePath).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      await page.render({
        canvasContext: ctx,
        viewport,
      } as any).promise;
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch (e) {
      console.warn("Cover extract failed:", e);
      return "";
    }
  };

  const handleGenerateBlog = async (catalog: Catalog) => {
    setGenerating(catalog.id);
    setMessage(null);

    try {
      // 1. Extract cover client-side
      const coverBase64 = await extractCover(catalog.filePath);

      // 2. Generate blog
      const res = await fetch("/api/admin/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogTitle: catalog.title,
          catalogId: catalog.id,
          filePath: catalog.filePath,
          validFrom: catalog.validFrom,
          validTo: catalog.validTo,
          coverBase64,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBlogResults(prev => ({ ...prev, [catalog.id]: data.post.slug }));
        setMessage({ type: "success", text: `Blog created: "${data.post.title}"` });
      } else {
        setMessage({ type: "error", text: data.error || "Blog generation failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Try again." });
    }

    setGenerating(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ color: "#0e76bc", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Dashboard</Link>
        <span style={{ color: "#d1d5db" }}>|</span>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Offers & Catalog</p>
      </div>

      <div style={{ maxWidth: 960, margin: "32px auto", padding: "0 24px" }}>

        {/* Message */}
        {message && (
          <div style={{
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: "1px solid " + (message.type === "success" ? "#bbf7d0" : "#fecaca"),
            borderRadius: 12, padding: "12px 16px", fontSize: 13,
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Upload Form */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload New Catalog
          </h2>
          <form onSubmit={handleUpload}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Catalog Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 17 Offers" required
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>PDF File</label>
                <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} required
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Valid From</label>
                <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)}
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Valid To</label>
                <input type="date" value={validTo} onChange={e => setValidTo(e.target.value)}
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            <button type="submit" disabled={uploading} style={{
              background: uploading ? "#9ca3af" : "#0e76bc",
              color: "white", border: "none", borderRadius: 10,
              padding: "11px 28px", fontSize: 14, fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {uploading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/><path d="M21 12a9 9 0 01-9 9"/></svg>
                  Uploading...
                </>
              ) : "Upload Catalog"}
            </button>
          </form>
        </div>

        {/* Catalog List */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            Uploaded Catalogs
          </h2>

          {loading ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Loading...</div>
          ) : catalogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 12px" }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p style={{ fontSize: 14 }}>No catalogs uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {catalogs.map((catalog) => (
                <div key={catalog.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>

                  {/* Main row */}
                  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>{catalog.title}</p>
                        <span style={{ background: "#eff6ff", color: "#0e76bc", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                          {catalog.id}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {catalog.validFrom && catalog.validTo
                          ? `Valid: ${catalog.validFrom} → ${catalog.validTo}`
                          : `Uploaded: ${new Date(catalog.createdAt).toLocaleDateString()}`}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {typeof window !== "undefined" ? window.location.origin : ""}/en/offers/{catalog.id}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button onClick={() => copyLink(catalog.id)} style={{
                        background: copied === catalog.id ? "#f0fdf4" : "#f3f4f6",
                        color: copied === catalog.id ? "#16a34a" : "#374151",
                        border: "1px solid " + (copied === catalog.id ? "#bbf7d0" : "#e5e7eb"),
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>
                        {copied === catalog.id ? "✓ Copied" : "Copy Link"}
                      </button>
                      <a href={catalog.filePath} target="_blank" rel="noopener noreferrer" style={{
                        background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none",
                      }}>View</a>
                      <button onClick={() => {
                        const msg = `🛒 *Trolleys Supermarket*\n\n🏷️ *${catalog.title}*\n${catalog.validFrom ? `📅 Valid: ${catalog.validFrom} → ${catalog.validTo}\n` : ""}\n📄 View Catalog:\n${window.location.origin}/en/offers/${catalog.id}\n\n🔔 Follow our channel!\nhttps://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p`;
                        navigator.clipboard.writeText(msg);
                        alert("WhatsApp message copied!");
                      }} style={{
                        background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>WA Msg</button>
                      <button onClick={() => setDeleteTarget(catalog)} style={{
                        background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>Delete</button>
                    </div>
                  </div>

                  {/* AI Blog Generator row */}
                  <div style={{
                    borderTop: "1px solid #f1f5f9",
                    padding: "12px 20px",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#374151" }}>AI Blog Generator</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Gemini AI — Auto SEO blog post + cover image from PDF</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {blogResults[catalog.id] && (
                        <Link href={`/en/blog/${blogResults[catalog.id]}`} target="_blank" style={{
                          background: "#eff6ff", color: "#0e76bc", border: "1px solid #bfdbfe",
                          borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none",
                        }}>
                          View Blog →
                        </Link>
                      )}
                      <button
                        onClick={() => handleGenerateBlog(catalog)}
                        disabled={generating === catalog.id}
                        style={{
                          background: generating === catalog.id ? "#e5e7eb" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                          color: generating === catalog.id ? "#9ca3af" : "white",
                          border: "none", borderRadius: 8, padding: "8px 18px",
                          fontSize: 12, fontWeight: 700,
                          cursor: generating === catalog.id ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        {generating === catalog.id ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.2"/><path d="M21 12a9 9 0 01-9 9"/></svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            Generate Blog Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 🔥 Delete Confirmation Lightbox */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Catalog"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}