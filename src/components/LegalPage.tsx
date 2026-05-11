// components/LegalPage.tsx
import { useLocale } from "next-intl";
import Breadcrumb from "@/components/Breadcrumb";

type Section = { title: string; content: string };

type Props = {
  title: string;
  subtitle: string;
  intro: string;
  sections: Section[];
};

export default function LegalPage({ title, subtitle, intro, sections }: Props) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <>
      <style>{`
        .legal-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #fdfbf9;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .legal-serif {
          font-family: Georgia, 'Times New Roman', serif;
        }
        .legal-content h2 {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .legal-content p {
          font-size: 14px;
          color: #4a4a4a;
          line-height: 1.85;
          margin-bottom: 24px;
        }
        .legal-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 999px;
          background: #1C75BC;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all .3s;
          box-shadow: 0 4px 12px rgba(28,117,188,.25);
        }
        .legal-back-btn:hover {
          background: #155a8e;
          transform: translateY(-2px);
        }

        @keyframes legalPulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @media(max-width: 768px) {
          .legal-article { padding: 28px 22px !important; }
        }
      `}</style>

      <div className="legal-page" dir={isRTL ? "rtl" : "ltr"}>
        <Breadcrumb locale={locale} crumbs={[{ label: title }]} />

        {/* HERO - Marka Mavisi */}
        <section style={{
          background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "48px 32px 52px"
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: .02,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{
            maxWidth: 1280, margin: "0 auto",
            position: "relative", zIndex: 1
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
              padding: "5px 14px", borderRadius: 999, marginBottom: 16
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#ffffff",
                animation: "legalPulse 2s ease-in-out infinite"
              }} />
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: ".12em",
                textTransform: "uppercase", color: "#ffffff"
              }}>
                {title}
              </span>
            </div>

            <h1 className="legal-serif" style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 12px",
              lineHeight: 1.12,
              letterSpacing: "-.02em"
            }}>
              {title}
            </h1>

            <p style={{
              fontSize: 14,
              color: "rgba(255,255,255,.48)",
              margin: 0,
              maxWidth: 500
            }}>
              {subtitle}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section style={{ padding: "48px 0 80px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(16px, 3vw, 32px)" }}>
            <article className="legal-article" style={{
              background: "#fff", borderRadius: 18,
              padding: "40px 36px", border: "1px solid #f0ebe4",
              boxShadow: "0 1px 4px rgba(0,0,0,.03)"
            }}>
              {/* Intro */}
              <div style={{
                fontSize: 15, color: "#7a7a7a", lineHeight: 1.8,
                marginBottom: 32, paddingBottom: 24,
                borderBottom: "1px solid #f0ebe4"
              }}>
                {intro}
              </div>

              {/* Sections */}
              <div className="legal-content">
                {sections.map((section, i) => (
                  <div key={i} style={{ marginBottom: i < sections.length - 1 ? 8 : 0 }}>
                    <h2 style={{ color: "#1a1a1a" }}>{section.title}</h2>
                    <p>{section.content}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Back to Home */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a href={`/${locale}`} className="legal-back-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                  style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                {isRTL ? "العودة للرئيسية" : "Back to Home"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}