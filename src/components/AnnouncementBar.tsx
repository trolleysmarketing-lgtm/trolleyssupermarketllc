"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

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

const DISMISS_KEY = "announcement_dismissed";

export default function AnnouncementBar() {
  const locale = useLocale();
  const isAr   = locale === "ar";

  const [data,      setData]      = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/announcement")
      .then(r => r.json())
      .then(d => {
        setData(d);
        // Check if user already dismissed this message
        const key = `${DISMISS_KEY}_${d.text_en?.slice(0, 20)}`;
        if (sessionStorage.getItem(key)) setDismissed(true);
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setDismissed(true);
    if (data) {
      const key = `${DISMISS_KEY}_${data.text_en?.slice(0, 20)}`;
      sessionStorage.setItem(key, "1");
    }
  };

  if (!data || !data.active || dismissed) return null;

  const text      = isAr ? data.text_ar      : data.text_en;
  const link      = isAr ? data.link_ar      : data.link_en;
  const linkLabel = isAr ? data.link_label_ar : data.link_label_en;

  if (!text) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{
        background:   data.bg || "#1C75BC",
        color:        data.textColor || "#fff",
        padding:      "10px 16px",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        gap:          12,
        fontSize:     13,
        fontWeight:   500,
        lineHeight:   1.4,
        position:     "relative",
        fontFamily:   "Inter, system-ui, sans-serif",
        zIndex:       150,
      }}
    >
      {/* Message */}
      <span style={{ textAlign: "center" }}>{text}</span>

      {/* Link */}
      {link && linkLabel && (
        <Link
          href={link}
          style={{
            color:          data.textColor || "#fff",
            fontWeight:     700,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            whiteSpace:     "nowrap",
            flexShrink:     0,
            opacity:        0.9,
          }}
        >
          {linkLabel}
        </Link>
      )}

      {/* Dismiss button */}
      {data.dismissible && (
        <button
          onClick={dismiss}
          aria-label="Close announcement"
          style={{
            position:   "absolute",
            top:        "50%",
            transform:  "translateY(-50%)",
            [isAr ? "left" : "right"]: 12,
            background: "none",
            border:     "none",
            color:      data.textColor || "#fff",
            cursor:     "pointer",
            opacity:    0.7,
            padding:    "4px",
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            width:      28,
            height:     28,
            transition: "opacity 0.2s, background 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.15)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}