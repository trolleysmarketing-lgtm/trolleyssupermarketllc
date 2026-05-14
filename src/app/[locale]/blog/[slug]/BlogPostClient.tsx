// app/[locale]/blog/[slug]/BlogPostClient.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { useState } from "react";

type Post = {
  slug: string;
  title: string;
  title_ar?: string;
  date: string;
  category: string;
  excerpt: string;
  excerpt_ar?: string;
  content: string;
  content_ar?: string;
  coverImage?: string;
};

const blogImages: Record<string, string> = {
  "smart-grocery-shopping-uae-save-money-2026": "/blog/smart-grocery-shopping-uae.webp",
  "healthy-eating-dubai-affordable-supermarket-foods": "/blog/healthy-eating-dubai-supermarket.webp",
  "how-to-choose-fresh-meat-fruits-vegetables-uae": "/blog/fresh-food-uae-supermarket-guide.webp",
  "best-weekly-supermarket-deals-uae-trolleys": "/blog/uae-supermarket-weekly-offers.webp",
  "daily-life-uae-supermarkets-shopping-guide": "/blog/supermarket-lifestyle-uae-dubai.webp",
  "top-imported-foods-uae-supermarkets-trolleys": "/blog/imported-foods-uae-supermarket.webp",
};

const getImage = (post: Post) => post.coverImage || blogImages[post.slug] || "";

// Detect if a string is predominantly Arabic
function isArabicText(text: string): boolean {
  if (!text) return false;
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars  = (text.match(/[a-zA-Z]/g) || []).length;
  return arabicChars > latinChars;
}

// Clean AI artifacts from text
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`/g, "")
    // Remove lines that look like JSON keys
    .split("\n")
    .filter(line => {
      const t = line.trim();
      if (t.startsWith("{") || t.startsWith("}")) return false;
      if (/^"[a-z_]+"\s*:/.test(t)) return false;
      return true;
    })
    .join("\n")
    // Remove leftover JSON objects
    .replace(/^\s*\{[\s\S]*?\}\s*$/m, "")
    .replace(/\{[^}]{0,200}\}/g, "")
    .trim();
}

export default function BlogPostClient({ post, allPosts }: { post: Post; allPosts: Post[] }) {
  const t      = useTranslations("blog");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const [showSidebar, setShowSidebar] = useState(false);

  const title = isRTL && post.title_ar ? post.title_ar : post.title;

  // For excerpt: use locale-appropriate field, fall back only if truly empty
  const rawExcerpt = (() => {
    if (isRTL) {
      const ar = cleanText(post.excerpt_ar || "");
      // Only use Arabic excerpt if it actually contains Arabic
      if (ar && isArabicText(ar)) return ar;
      return ""; // don't show English excerpt on Arabic page
    }
    const en = cleanText(post.excerpt || "");
    // Don't show Arabic text on English page
    if (en && !isArabicText(en)) return en;
    return "";
  })();

  // For content: use locale-appropriate field
  const rawContent = (() => {
    if (isRTL) {
      const ar = cleanText(post.content_ar || "");
      if (ar && isArabicText(ar)) return ar;
      return cleanText(post.content || ""); // fallback to English only if no Arabic
    }
    const en = cleanText(post.content || "");
    return en;
  })();

  const excerpt     = rawExcerpt.slice(0, 240);
  const image       = getImage(post);
  const recentPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 4);
  const paragraphs  = rawContent.split("\n").filter(p => p.trim());

  const isHeading = (para: string, i: number) =>
    i > 0 && para.length < 80 &&
    !para.startsWith("Q:") && !para.startsWith("A:") &&
    !para.startsWith("س:") && !para.startsWith("ج:") &&
    !para.startsWith("http") && !para.includes("whatsapp") &&
    para.split(" ").length <= 8;

  const sidebar = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {recentPosts.length > 0 && (
        <div className="bp-card">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #1C75BC" }}>
            {isRTL ? "مقالات حديثة" : "Recent Posts"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentPosts.map(p => {
              const pImg   = getImage(p);
              const pTitle = isRTL && p.title_ar ? p.title_ar : p.title;
              return (
                <Link key={p.slug} href={`/${locale}/blog/${p.slug}`} className="bp-recent" onClick={() => setShowSidebar(false)}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#e8f4fd" }}>
                    {pImg ? (
                      <img src={pImg} alt={pTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1C75BC", opacity: .4 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4, margin: "0 0 3px" }}>{pTitle}</p>
                    <span style={{ fontSize: 10, color: "#a0a0a0" }}>{p.date}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #155a8e 100%)", borderRadius: 16, padding: "20px", color: "#fff" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{isRTL ? "قناة الواتساب" : "WhatsApp Channel"}</h3>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.65)", lineHeight: 1.5, marginBottom: 14 }}>{isRTL ? "عروض أسبوعية مجاناً" : "Free weekly offers"}</p>
        <a href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p" target="_blank" rel="noopener noreferrer" className="bp-sbtn" style={{ background: "#25d366", color: "#fff" }}>
          {isRTL ? "انضم مجاناً" : "Join Free"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div className="bp-card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #1C75BC" }}>
          {isRTL ? "وسائل التواصل" : "Follow Us"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="https://www.instagram.com/trolleysuae" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "inherit", background: "#fdf2f8" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Instagram</p><p style={{ fontSize: 10, color: "#a0a0a0", margin: 0 }}>@trolleysuae</p></div>
          </a>
          <a href="https://www.facebook.com/trolleysuae" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "inherit", background: "#eff6ff" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Facebook</p><p style={{ fontSize: 10, color: "#a0a0a0", margin: 0 }}>Trolleys UAE</p></div>
          </a>
          <a href="https://www.tiktok.com/@trolleysuae" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "inherit", background: "#f5f5f5" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>TikTok</p><p style={{ fontSize: 10, color: "#a0a0a0", margin: 0 }}>@trolleysuae</p></div>
          </a>
        </div>
      </div>

      <div className="bp-card">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{isRTL ? "عروض هذا الأسبوع" : "This Week's Offers"}</h3>
        <p style={{ fontSize: 11, color: "#7a7a7a", lineHeight: 1.5, marginBottom: 14 }}>{isRTL ? "اكتشف أحدث العروض" : "Discover the latest deals"}</p>
        <Link href={`/${locale}/offers`} className="bp-sbtn" style={{ background: "#1C75BC", color: "#fff" }} onClick={() => setShowSidebar(false)}>
          {isRTL ? "عرض العروض" : "View Offers"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .bp { font-family: 'Inter', system-ui, sans-serif; }
        .bp-serif { font-family: Georgia, 'Times New Roman', serif; }
        .bp-article { background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #f0ebe4; box-shadow: 0 1px 4px rgba(0,0,0,.03); }
        .bp-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #f0ebe4; }
        .bp-recent { text-decoration: none; display: flex; gap: 12px; align-items: flex-start; padding: 10px; border-radius: 10px; transition: background .25s; color: inherit; }
        .bp-recent:hover { background: #e8f4fd; }
        .bp-back { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 999px; background: #1C75BC; color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; transition: all .3s; box-shadow: 0 4px 12px rgba(28,117,188,.25); }
        .bp-back:hover { background: #155a8e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,117,188,.35); }
        .bp-sbtn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; font-weight: 700; font-size: 12.5px; text-decoration: none; transition: all .2s; }
        .bp-sbtn:hover { transform: translateY(-1px); }
        .bp-fab { display: none; position: fixed; bottom: 50%; right: 24px; z-index: 999; width: 52px; height: 52px; border-radius: 14px; background: #1C75BC; color: #fff; border: none; cursor: pointer; box-shadow: 0 8px 24px rgba(28,117,188,.35); align-items: center; justify-content: center; transition: all .3s; animation: fabPulse 2s ease-in-out infinite; }
        .bp-fab:hover { transform: scale(1.05); }
        .bp-fab:active { transform: scale(.95); }
        @keyframes fabPulse { 0%, 100% { box-shadow: 0 8px 24px rgba(28,117,188,.35); } 50% { box-shadow: 0 8px 32px rgba(28,117,188,.5); } }
        .bp-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; backdrop-filter: blur(4px); }
        .bp-overlay.show { display: block; }
        .bp-popup { display: none; position: fixed; top: 0; right: 0; bottom: 0; width: 340px; max-width: 90vw; background: #fff; z-index: 1001; overflow-y: auto; padding: 20px; box-shadow: -8px 0 32px rgba(0,0,0,.15); animation: slideIn .3s ease-out; }
        .bp-popup.show { display: block; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        [dir=rtl] .bp-popup { right: auto; left: 0; animation: slideInRTL .3s ease-out; }
        [dir=rtl] .bp-fab { right: auto; left: 24px; }
        @keyframes slideInRTL { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .bp-popup-close { position: sticky; top: 0; float: right; width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; border: none; cursor: pointer; display: flex; align-items: center; justifyContent: center; color: #64748b; font-size: 16px; z-index: 2; margin-bottom: 16px; }
        .bp-popup-close:hover { background: #e2e8f0; }
        [dir=rtl] .bp-popup-close { float: left; }
        @media(max-width: 900px) { .bp-layout { grid-template-columns: 1fr !important; } .bp-sidebar { display: none !important; } .bp-fab { display: flex !important; } }
      `}</style>

      <div className="bp" style={{ background: "#fff", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>
        <Breadcrumb locale={locale} crumbs={[{ label: t("title"), href: `/${locale}/blog` }, { label: title }]} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(16px, 3vw, 32px) 80px" }}>
          <div className="bp-layout" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 26, alignItems: "start" }}>

            {/* ARTICLE */}
            <article className="bp-article">
              {image && (
                <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
                  <img src={image} alt={title} style={{ width: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", top: 18, left: isRTL ? "auto" : 18, right: isRTL ? 18 : "auto" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: "#1C75BC", color: "#fff", padding: "5px 14px", borderRadius: 999 }}>{post.category}</span>
                  </div>
                </div>
              )}

              <div style={{ padding: "36px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
                  {!image && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#e8f4fd", color: "#1C75BC", padding: "5px 14px", borderRadius: 999, letterSpacing: ".06em", textTransform: "uppercase" }}>{post.category}</span>
                  )}
                  <span style={{ fontSize: 12, color: "#a0a0a0", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {post.date}
                  </span>
                </div>

                <h1 className="bp-serif" style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.22, letterSpacing: "-.015em", marginBottom: 24 }}>{title}</h1>

                {excerpt && (
                  <div style={{ fontSize: 15, color: "#7a7a7a", fontWeight: 500, lineHeight: 1.8, marginBottom: 32, padding: "16px 20px", background: "#e8f4fd", borderLeft: isRTL ? "none" : "3px solid #1C75BC", borderRight: isRTL ? "3px solid #1C75BC" : "none", borderRadius: isRTL ? "10px 0 0 10px" : "0 10px 10px 0" }}>{excerpt}</div>
                )}

                {/* Content */}
                {paragraphs.length > 0 ? (
                  <div style={{ fontSize: 14.5, color: "#4a4a4a", lineHeight: 1.9 }}>
                    {paragraphs.map((para, i) => {
                      if (para.toLowerCase().includes("whatsapp") || para.startsWith("Join our") || para.startsWith("انضم")) {
                        return (
                          <div key={i} style={{ background: "#e8f4fd", border: "1px solid #d0e8f8", borderRadius: 12, padding: "18px 22px", marginTop: 24, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                            <a href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p" target="_blank" rel="noopener noreferrer" style={{ color: "#1C75BC", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                              {isRTL ? "انضم لقناتنا على واتساب للعروض الأسبوعية" : "Join our WhatsApp Channel for weekly offers →"}
                            </a>
                          </div>
                        );
                      }
                      if (para.startsWith("Q:") || para.startsWith("س:")) {
                        return <div key={i} style={{ background: "#e8f4fd", border: "1px solid #d0e8f8", borderRadius: 10, padding: "14px 18px", marginBottom: 6, marginTop: 16 }}><p style={{ fontWeight: 700, color: "#1C75BC", fontSize: 14, margin: 0 }}>{para}</p></div>;
                      }
                      if (para.startsWith("A:") || para.startsWith("ج:")) {
                        return <div key={i} style={{ background: "#fdfbf9", border: "1px solid #f0ebe4", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}><p style={{ color: "#4a4a4a", fontSize: 14, margin: 0 }}>{para}</p></div>;
                      }
                      if (isHeading(para, i)) {
                        return <h2 key={i} className="bp-serif" style={{ fontSize: 19, fontWeight: 700, color: "#1a1a1a", marginTop: 36, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #f0ebe4" }}>{para}</h2>;
                      }
                      return <p key={i} style={{ marginBottom: 16 }}>{para}</p>;
                    })}
                  </div>
                ) : (
                  <p style={{ color: "#a0a0a0", fontSize: 14 }}>
                    {isRTL ? "المحتوى غير متوفر." : "Content not available."}
                  </p>
                )}

                <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #f0ebe4" }}>
                  <Link href={`/${locale}/blog`} className="bp-back">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    {t("back")}
                  </Link>
                </div>
              </div>
            </article>

            {/* DESKTOP SIDEBAR */}
            <aside className="bp-sidebar">{sidebar}</aside>
          </div>
        </div>

        {/* MOBIL FAB */}
        <button className="bp-fab" onClick={() => setShowSidebar(true)} aria-label={isRTL ? "خيارات" : "Options"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
        </button>

        {/* MOBIL OVERLAY */}
        <div className={`bp-overlay ${showSidebar ? "show" : ""}`} onClick={() => setShowSidebar(false)} />

        {/* MOBIL POPUP */}
        <div className={`bp-popup ${showSidebar ? "show" : ""}`}>
          <button className="bp-popup-close" onClick={() => setShowSidebar(false)} aria-label={isRTL ? "إغلاق" : "Close"}>✕</button>
          <div style={{ clear: "both" }}>{sidebar}</div>
        </div>
      </div>
    </>
  );
}