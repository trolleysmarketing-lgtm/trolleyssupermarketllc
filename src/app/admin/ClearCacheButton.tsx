"use client";
// src/app/admin/ClearCacheButton.tsx
import { useState } from "react";

export default function ClearCacheButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClear = async () => {
    setStatus("loading");
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      const res = await fetch("/api/admin/clear-cache", {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      const d = await res.json();
      if (d.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label = {
    idle:    "🗑️ Clear Cache",
    loading: "Clearing…",
    success: "✓ Cache Cleared!",
    error:   "⚠ Failed",
  }[status];

  const bg = {
    idle:    "#f3f4f6",
    loading: "#f3f4f6",
    success: "#f0fdf4",
    error:   "#fef2f2",
  }[status];

  const color = {
    idle:    "#374151",
    loading: "#9ca3af",
    success: "#16a34a",
    error:   "#dc2626",
  }[status];

  const border = {
    idle:    "#e5e7eb",
    loading: "#e5e7eb",
    success: "#bbf7d0",
    error:   "#fecaca",
  }[status];

  return (
    <button
      onClick={handleClear}
      disabled={status === "loading"}
      title="Clear Next.js page cache — forces all pages to refresh"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: status === "loading" ? "not-allowed" : "pointer",
        background: bg,
        color,
        border: `1px solid ${border}`,
        transition: "all .2s",
        whiteSpace: "nowrap",
      }}
    >
      {status === "loading" && (
        <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #d1d5db", borderTopColor: "#6b7280", borderRadius: "50%", animation: "cc-spin .6s linear infinite" }}/>
      )}
      <style>{`@keyframes cc-spin{to{transform:rotate(360deg)}}`}</style>
      {label}
    </button>
  );
}