"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export default function ContactClient() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameRef.current?.value,
          email: emailRef.current?.value,
          phone: phoneRef.current?.value,
          subject: subjectRef.current?.value,
          message: messageRef.current?.value,
        }),
      });
      if (res.ok) setSent(true);
      else setError(t("error"));
    } catch {
      setError(t("error"));
    } finally {
      setSending(false);
    }
  };

  const branches = [
    { name: isAr ? "مردف — دبي" : "Mirdif — Dubai", hours: "7AM – 2AM", phone: "+971 4 232 2966", wa: "971504986988", color: "#1C75BC" },
    { name: isAr ? "التعاون — الشارقة" : "Al Taawun — Sharjah", hours: "7AM – 3AM", phone: "+971 6 554 4505", wa: "971504059699", color: "#DB2B2C" },
    { name: isAr ? "الخان — الشارقة" : "Al Khan — Sharjah", hours: "7AM – 2AM", phone: "+971 6 575 7010", wa: "971547695919", color: "#DB2B2C" },
    { name: isAr ? "النعيمية — عجمان" : "Al Nuaimia — Ajman", hours: "7AM – 2AM", phone: "+971 6 749 9919", wa: "971563291296", color: "#DB2B2C" },
  ];

  const contactCards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.8" strokeLinecap="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      label: t("phone_label"), value: t("phone_value"), sub: t("phone_sub"),
      href: "tel:+97142322966", bg: "#e8f4fd",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#25d366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
      ),
      label: t("whatsapp_label"), value: t("whatsapp_value"), sub: t("whatsapp_sub"),
      href: "https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p", bg: "#ecfdf5",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#DB2B2C">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
      ),
      label: isAr ? "واتساب الإدارة" : "Admin WhatsApp", value: "+971 56 408 7776",
      sub: isAr ? "للاستفسارات التجارية" : "For business inquiries",
      href: "https://wa.me/971564087776", bg: "#fef2f2",
    },
  ];

  return (
    <>
      <style>{`
        .cp { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        .input-focus:focus { border-color: #1C75BC !important; box-shadow: 0 0 0 3px rgba(28,117,188,.06) !important; }
        .contact-card { transition: all .25s; text-decoration: none; color: inherit; }
        .contact-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
        .submit-btn { transition: all .25s; }
        .submit-btn:hover:not(:disabled) { background: #155a8e !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(28,117,188,.25); }
        .branch-row { transition: all .2s; }
        .branch-row:hover { background: #f8fafc; }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @media(max-width:800px) {
          .content-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:640px) {
          .contact-cards { grid-template-columns: 1fr !important; }
          .name-row { grid-template-columns: 1fr !important; }
          .branch-actions { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
        }
      `}</style>

      <div className="cp" style={{ background: "#fff", minHeight: "100vh", direction: isAr ? "rtl" : "ltr" }}>

        <Breadcrumb locale={locale} crumbs={[{ label: t("breadcrumb") }]} />

        {/* HERO */}
        <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)", position: "relative", overflow: "hidden", padding: "48px 32px 52px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", padding: "5px 14px", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff" }}>{t("hero_badge")}</span>
            </div>
            <h1 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontStyle: "italic", fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.02em" }}>
              {t("hero_title_line1")}{" "}<em style={{ color: "#fff", fontStyle: "italic" }}>{t("hero_title_line2")}</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", margin: 0, maxWidth: 500 }}>{t("hero_description")}</p>
          </div>
        </div>

        {/* FORM + SAATLER YAN YANA */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
          <div className="content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "flex-start" }}>

            {/* FORM - SOL */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #f0ebe4", boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{t("form_title")}</h2>
              <p style={{ fontSize: 13, color: "#a0a0a0", marginBottom: 24 }}>{isAr ? "سنرد عليك في أقرب وقت" : "We'll get back to you ASAP"}</p>

              {sent ? (
                <div style={{ textAlign: "center", padding: "48px 24px" }}>
                  <div style={{ width: 68, height: 68, background: "#e8f4fd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 className="serif" style={{ fontSize: 20, color: "#1a1a1a", marginBottom: 10 }}>{t("sent")}</h3>
                  <p style={{ fontSize: 14, color: "#7a7a7a" }}>{t("sent_description")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>{t("name")} <span style={{ color: "#DB2B2C" }}>*</span></label>
                      <input ref={nameRef} type="text" required className="input-focus" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #e8e3dc", borderRadius: 8, outline: "none", fontFamily: "'Inter', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", transition: "border-color .25s, box-shadow .25s", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>{t("email")} <span style={{ color: "#DB2B2C" }}>*</span></label>
                      <input ref={emailRef} type="email" required className="input-focus" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #e8e3dc", borderRadius: 8, outline: "none", fontFamily: "'Inter', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", transition: "border-color .25s, box-shadow .25s", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>{t("phone")}</label>
                    <input ref={phoneRef} type="tel" className="input-focus" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #e8e3dc", borderRadius: 8, outline: "none", fontFamily: "'Inter', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", transition: "border-color .25s, box-shadow .25s", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>{t("subject")} <span style={{ color: "#DB2B2C" }}>*</span></label>
                    <input ref={subjectRef} type="text" required className="input-focus" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #e8e3dc", borderRadius: 8, outline: "none", fontFamily: "'Inter', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", transition: "border-color .25s, box-shadow .25s", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>{t("message")} <span style={{ color: "#DB2B2C" }}>*</span></label>
                    <textarea ref={messageRef} required rows={4} className="input-focus" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #e8e3dc", borderRadius: 8, outline: "none", fontFamily: "'Inter', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", transition: "border-color .25s, box-shadow .25s", boxSizing: "border-box", resize: "vertical", minHeight: 100 }} />
                  </div>
                  {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ fontSize: 13, color: "#DB2B2C", margin: 0, fontWeight: 500 }}>{error}</p>
                    </div>
                  )}
                  <button type="submit" disabled={sending} className="submit-btn" style={{ background: "#1C75BC", color: "#fff", padding: "14px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", opacity: sending ? .65 : 1 }}>
                    {sending ? t("sending") : t("send")}
                  </button>
                </form>
              )}
            </div>

            {/* SAATLER - SAĞ */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f0ebe4", boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#a0a0a0", margin: "0 0 6px", letterSpacing: ".08em", textTransform: "uppercase" }}>
                {t("hours_title")}
              </p>
              <h3 className="serif" style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 20px" }}>
                {isAr ? "فروعنا" : "Our Branches"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {branches.map((b, i) => (
                  <div key={i} className="branch-row" style={{
                    padding: "14px 0",
                    borderBottom: i < branches.length - 1 ? "1px solid #f0ebe4" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{b.name}</p>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: b.color, padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap" }}>{b.hours}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "#a0a0a0", margin: "0 0 8px" }}>{b.phone}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={`tel:${b.phone}`} style={{
                        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
                        padding: "7px 0", borderRadius: 8, background: "#1C75BC", color: "#fff",
                        fontSize: 11, fontWeight: 600, textDecoration: "none"
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                        {isAr ? "اتصل" : "Call"}
                      </a>
                      <a href={`https://wa.me/${b.wa}`} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
                        padding: "7px 0", borderRadius: 8, background: "#25d366", color: "#fff",
                        fontSize: 11, fontWeight: 600, textDecoration: "none"
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}