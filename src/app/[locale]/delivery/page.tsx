"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export default function DeliveryPage() {
  const t = useTranslations("delivery");
  const locale = useLocale();
  const isAr = locale === "ar";

  const BRAND = {
    blue: "#1C75BC",
    blueHover: "#155a8e",
    red: "#DB2B2C",
    redHover: "#c42021",
  };

  const branches = [
    {
      name: isAr ? "التعاون — الشارقة" : "Al Taawun — Sharjah",
      address: isAr ? "895C+XXP - الخان - الشارقة" : "895C+XXP - Al Khan - Sharjah",
      phone: "+971 6 554 4505",
      wa: "971504059699",
      maps: "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
      hours: "7AM – 3AM",
      city: "Sharjah",
      cityColor: BRAND.red,
      img: "/store/Al-Taawun-Sharjah.webp",
    },
    {
      name: isAr ? "الخان — الشارقة" : "Al Khan — Sharjah",
      address: isAr ? "شارع الخان - حي الخالدية" : "Al Khan St - Al Khalidiya",
      phone: "+971 6 575 7010",
      wa: "971547695919",
      maps: "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
      hours: "7AM – 2AM",
      city: "Sharjah",
      cityColor: BRAND.red,
      img: "/store/Al-Khan-Sharjah.webp",
    },
    {
      name: isAr ? "مردف — دبي" : "Mirdif — Dubai",
      address: isAr ? "مركز تسوق جولدن جيت - مردف" : "Golden Gate Shopping Centre",
      phone: "+971 4 232 2966",
      wa: "971504986988",
      maps: "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
      hours: "7AM – 2AM",
      city: "Dubai",
      cityColor: BRAND.blue,
      img: "/store/Mirdif-Dubai.webp",
    },
    {
      name: isAr ? "النعيمية — عجمان" : "Al Nuaimia — Ajman",
      address: isAr ? "سوق المنامة - النعيمية 1" : "Al Manama Haybermarket",
      phone: "+971 6 749 9919",
      wa: "971563291296",
      maps: "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
      hours: "7AM – 2AM",
      city: "Ajman",
      cityColor: BRAND.red,
      img: "/store/Al-Nuaimia-Ajman.webp",
    },
  ];

  return (
    <>
      <style>{`
        .delivery-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #fdfbf9;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .serif {
          font-family: Georgia, 'Times New Roman', serif;
        }
        .store-card {
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #f0ebe4;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
          transition: all .35s cubic-bezier(.25,.46,.45,.94);
        }
        .store-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0,0,0,.06);
        }
        .store-img {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }
        .store-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .6s cubic-bezier(.25,.46,.45,.94);
        }
        .store-card:hover .store-img img {
          transform: scale(1.06);
        }
        .store-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%);
        }
        .store-city {
          position: absolute;
          top: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #fff;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .store-hrs {
          position: absolute;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,.5);
          backdrop-filter: blur(8px);
          padding: 5px 10px;
          border-radius: 999px;
          color: rgba(255,255,255,.9);
        }
        .store-hrs time {
          font-size: 10px;
          font-weight: 500;
        }
        .store-body {
          padding: 16px 16px 18px;
        }
        .store-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .store-addr {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 11.5px;
          color: #a0a0a0;
          margin-bottom: 14px;
          line-height: 1.5;
          font-style: normal;
        }

        @media(max-width: 900px) {
          .delivery-branch-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width: 560px) {
          .delivery-branch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="delivery-page" dir={isAr ? "rtl" : "ltr"}>
        <Breadcrumb locale={locale} crumbs={[{ label: t("title") }]} />

        {/* HERO */}
        <div style={{
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blue} 100%)`,
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
          
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
              padding: "5px 14px", borderRadius: 999, marginBottom: 16
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#ffffff",
                animation: "pulse 2s ease-in-out infinite"
              }} />
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: ".12em",
                textTransform: "uppercase", color: "#ffffff"
              }}>
                {isAr ? "التوصيل متاح" : "Delivery Available"}
              </span>
            </div>

            <h1 className="serif" style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 12px",
              lineHeight: 1.12,
              letterSpacing: "-.02em"
            }}>
              {t("title")}{" "}
              <em style={{ color: "#ffffff", fontStyle: "italic" }}>{t("subtitle")}</em>
            </h1>

            <p style={{
              fontSize: 14,
              color: "rgba(255,255,255,.48)",
              margin: "0 0 24px",
              maxWidth: 500
            }}>
              {isAr
                ? "توصيل سريع إلى منزلك في دبي والشارقة وعجمان"
                : "Fast delivery to your home across Dubai, Sharjah & Ajman"}
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="https://instashop.com/en-ae/client/trolleys-sharjah"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 999,
                  background: "#fff", color: BRAND.blue,
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  transition: "all .25s", boxShadow: "0 4px 12px rgba(0,0,0,.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>
                  <path d="M6 17H3V6a2 2 0 012-2h2l4 6h5l2 4h1"/><path d="M16 13h-3l-1-2"/>
                </svg>
                InstaShop
              </a>

              <a
                href="https://www.talabat.com/uae/trolleys-supermarket"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 999,
                  background: BRAND.red, color: "#fff",
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  transition: "all .25s", boxShadow: "0 4px 12px rgba(219,43,44,.25)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BRAND.redHover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(219,43,44,.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BRAND.red;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(219,43,44,.25)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Talabat
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 999,
                  background: "#25d366", color: "#fff",
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  transition: "all .25s", boxShadow: "0 4px 12px rgba(37,211,102,.25)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1dbc58";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#25d366";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,211,102,.25)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                {isAr ? "واتساب" : "WhatsApp"}
              </a>
            </div>
          </div>
        </div>

        {/* BRANCHES - Anasayfadaki store kartları ile aynı stil */}
        <section style={{ padding: "80px 0", background: "#fff" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 32px)" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: "#c8956c", marginBottom: 14
              }}>
                <span style={{ width: 20, height: 1, background: "#c8956c", opacity: .4 }} />
                {isAr ? "فروعنا" : "Our Branches"}
                <span style={{ width: 20, height: 1, background: "#c8956c", opacity: .4 }} />
              </span>
              <h2 className="serif" style={{
                fontSize: "clamp(24px, 3.5vw, 40px)",
                fontWeight: 400, color: "#1a1a1a",
                lineHeight: 1.12, letterSpacing: "-.02em", marginBottom: 8
              }}>
                {isAr ? "اطلب من أقرب فرع" : "Order from Your Nearest Store"}
              </h2>
              <p style={{ fontSize: 13, color: "#a0a0a0" }}>
                {isAr ? "4 فروع في دبي والشارقة وعجمان" : "4 branches across Dubai, Sharjah & Ajman"}
              </p>
            </div>

            <div className="delivery-branch-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20
            }}>
              {branches.map((store, i) => (
                <article key={store.name} className="store-card">
                  <div className="store-img">
                    <img src={store.img} alt={store.name} loading={i < 4 ? "eager" : "lazy"} width={400} height={300} />
                    <div className="store-fade" aria-hidden="true" />
                    
                    {/* City Badge */}
                    <span className="store-city" style={{
                      background: store.cityColor,
                      [isAr ? "right" : "left"]: "10px"
                    }}>
                      {store.city}
                    </span>

                    {/* Hours */}
                    <div className="store-hrs" style={{ [isAr ? "right" : "left"]: "12px" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <time>{store.hours}</time>
                    </div>
                  </div>

                  <div className="store-body">
                    <h3 className="store-name">{store.name}</h3>
                    <address className="store-addr">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{store.address}</span>
                    </address>

                    {/* Buttons - Anasayfadaki gibi 3'lü */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {/* Call */}
                      <a
                        href={`tel:${store.phone}`}
                        aria-label={`${isAr ? "اتصل" : "Call"} ${store.name}`}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          gap: "7px", padding: "10px 18px",
                          background: BRAND.blue, color: "#fff",
                          borderRadius: "999px", fontSize: "12.5px", fontWeight: 600,
                          textDecoration: "none", letterSpacing: ".01em",
                          transition: "background .2s, transform .2s",
                          flex: "1 1 auto", minWidth: "75px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = BRAND.blueHover;
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = BRAND.blue;
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        {isAr ? "اتصل" : "Call"}
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${store.wa}`}
                        target="_blank" rel="noopener noreferrer"
                        aria-label={`WhatsApp ${store.name}`}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          gap: "7px", padding: "10px 18px",
                          background: "#25d366", color: "#fff",
                          borderRadius: "999px", fontSize: "12.5px", fontWeight: 600,
                          textDecoration: "none", letterSpacing: ".01em",
                          transition: "background .2s, transform .2s",
                          flex: "1 1 auto", minWidth: "75px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1dbc58";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#25d366";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                        </svg>
                        WhatsApp
                      </a>

                      {/* Map */}
                      <a
                        href={store.maps}
                        target="_blank" rel="noopener noreferrer"
                        aria-label={`${isAr ? "خريطة" : "Map"} ${store.name}`}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          gap: "7px", padding: "10px 18px",
                          background: "#f8fafc", color: "#1a1a1a",
                          borderRadius: "999px", fontSize: "12.5px", fontWeight: 600,
                          textDecoration: "none", letterSpacing: ".01em",
                          border: "1.5px solid #e2e8f0",
                          transition: "all .2s",
                          flex: "1 1 auto", minWidth: "75px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1a1a1a";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.borderColor = "#1a1a1a";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                          e.currentTarget.style.color = "#1a1a1a";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {isAr ? "خريطة" : "Map"}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blue} 100%)`,
          padding: "72px 0", textAlign: "center",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,149,108,.08) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />
          <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)", position: "relative", zIndex: 1 }}>
            <h2 className="serif" style={{
              fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 400,
              color: "#fff", lineHeight: 1.15, marginBottom: 12
            }}>
              {isAr ? "لديك سؤال؟" : "Have a Question?"}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", marginBottom: 28, lineHeight: 1.7 }}>
              {isAr ? "فريقنا جاهز لمساعدتك" : "Our team is ready to help"}
            </p>
            <Link href={`/${locale}/contact`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 999,
                background: "#ffffff", color: BRAND.blue,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                transition: "all .3s"
              }}>
              {isAr ? "تواصل معنا" : "Contact Us"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </>
  );
}