"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

const StoresMap = dynamic(() => import("@/components/StoresMap"), { ssr: false });

type Store = { name: string; city: string; address: string; phone: string; whatsapp: string; maps: string; hours: string; lat: number; lng: number; };

const storeImages: Record<string, string> = {
  Ajman: "/store/Al-Nuaimia-Ajman.webp",
  Dubai: "/store/Mirdif-Dubai.webp",
  "Sharjah-Khan": "/store/Al-Khan-Sharjah.webp",
  "Sharjah-Taawun": "/store/Al-Taawun-Sharjah.webp",
  "Oasis-Street": "/store/oasis-ajman.webp",
};

const storeSlugMap: Record<string, string> = {
  "Trolleys - Mirdif":       "mirdif-dubai",
  "Trolleys - Al Taawun":    "al-taawun-sharjah",
  "Trolleys - Al Khan":      "al-khan-sharjah",
  "Trolleys - Al Nuaimiya":  "al-nuaimiya-ajman",
  "Trolleys - Oasis Street": "oasis-street-ajman",
};

function getStoreImage(store: Store) {
  if (store.name.toLowerCase().includes("oasis")) return "/store/oasis-ajman.webp";
  if (store.city === "Ajman") return storeImages["Ajman"];
  if (store.city === "Dubai") return storeImages["Dubai"];
  if (store.name.toLowerCase().includes("khan")) return storeImages["Sharjah-Khan"];
  return storeImages["Sharjah-Taawun"];
}

const WAIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const PhoneIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const MapIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function StoresPage() {
  const t = useTranslations("stores");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const stores = t.raw("stores_list") as Store[];
  const [activeCity, setActiveCity] = useState("all");
  const [search, setSearch] = useState("");
  const [activeStore, setActiveStore] = useState<string | null>(null);

  const filteredStores = stores.filter(s =>
    (activeCity === "all" || s.city === activeCity) &&
    (search === "" || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const cities = ["all", "Dubai", "Sharjah", "Ajman"];
  const cityLabels: Record<string, string> = {
    all: t("filter_all"),
    Dubai: t("filter_dubai"),
    Sharjah: t("filter_sharjah"),
    Ajman: t("filter_ajman"),
  };
  const cityConfig: Record<string, { bg: string; color: string; border: string }> = {
    Dubai:   { bg: "#f0f4f8", color: "#1a2e3f", border: "#dde4ed" },
    Sharjah: { bg: "#faf6f2", color: "#c8956c", border: "#f0e4d8" },
    Ajman:   { bg: "#f0f4f8", color: "#2c4a63", border: "#d5dfe8" },
  };

  return (
    <>
      <style>{`
        .cp { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        .stores-card {
          background: #fff;
          border: 1px solid #f0ebe4;
          border-radius: 14px;
          transition: all .3s cubic-bezier(.25,.46,.45,.94);
          cursor: pointer;
          flex-shrink: 0;
        }
        .stores-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,.05), 0 4px 10px rgba(0,0,0,.03);
        }
        .stores-card.active {
          border-color: #c8956c !important;
          box-shadow: 0 0 0 2px rgba(200,149,108,.15) !important;
        }
        .stores-card-img {
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .stores-card:hover .stores-card-img {
          transform: scale(1.06);
        }
        .stores-filter-btn {
          padding: 7px 18px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all .25s;
          letter-spacing: .02em;
        }
        .stores-filter-btn.on { background: #1C75BC; color: #fff; box-shadow: 0 2px 8px rgba(26,46,63,.2); }
        .stores-filter-btn.off { background: #fff; color: #7a7a7a; border: 1px solid #f0ebe4; }
        .stores-filter-btn.off:hover { background: #faf6f2; color: #c8956c; border-color: #e8d5c0; }
        .stores-action-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; flex: 1; padding: 9px 8px; border-radius: 8px;
          font-size: 11.5px; font-weight: 600; text-decoration: none;
          border: none; cursor: pointer; transition: all .2s; letter-spacing: .01em;
        }
        .stores-action-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .stores-details-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; width: 100%; margin-top: 8px; padding: 7px 12px;
          border-radius: 8px; font-size: 11.5px; font-weight: 600;
          color: #1C75BC; text-decoration: none;
          border: 1px solid #dbeafe; background: #eff8ff;
          transition: all .2s;
        }
        .stores-details-btn:hover { background: #1C75BC; color: #fff; border-color: #1C75BC; }
        .stores-search {
          width: 100%; border: 1.5px solid #f0ebe4; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; outline: none;
          font-family: 'Inter', system-ui, sans-serif; transition: all .25s;
          background: #fdfbf9; color: #4a4a4a;
        }
        .stores-search::placeholder { color: #a0a0a0; }
        .stores-search:focus { border-color: #c8956c; background: #fff; box-shadow: 0 0 0 3px rgba(200,149,108,.08); }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        .stores-layout { display: flex; gap: 22px; align-items: stretch; }
        .stores-list-scroll {
          overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin; scrollbar-color: #e0d5c5 transparent; padding-right: 4px;
        }
        .stores-list-scroll::-webkit-scrollbar { width: 5px; }
        .stores-list-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .stores-list-scroll::-webkit-scrollbar-thumb { background: #e0d5c5; border-radius: 10px; }
        .stores-list-scroll::-webkit-scrollbar-thumb:hover { background: #c8956c; }
        @media(min-width: 1025px) {
          .stores-layout { flex-direction: row !important; }
          .stores-map-col { width: 58% !important; position: sticky !important; top: 80px !important; height: 580px !important; order: 0 !important; }
          .stores-list-col { width: 42% !important; order: 1 !important; display: flex !important; flex-direction: column !important; max-height: 580px !important; }
          .stores-list-scroll { flex: 1 !important; }
          .map-zoom-hint { display: block !important; }
          .map-touch-hint { display: none !important; }
        }
        @media(max-width: 1024px) {
          .stores-layout { flex-direction: column !important; }
          .stores-list-col { width: 100% !important; order: 0 !important; max-height: none !important; }
          .stores-list-scroll { max-height: none !important; overflow-y: visible !important; }
          .stores-map-col { width: 100% !important; position: relative !important; top: 0 !important; height: 450px !important; order: 1 !important; }
          .map-zoom-hint { display: none !important; }
          .map-touch-hint { display: block !important; }
        }
      `}</style>

      <div className="cp" style={{ background: "#fdfbf9", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>

        <Breadcrumb locale={locale} crumbs={[{ label: t("breadcrumb") }]} />

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)", position: "relative", overflow: "hidden", padding: "48px 32px 52px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", padding: "5px 14px", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffffff", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#ffffff" }}>{t("hero_badge")}</span>
            </div>
            <h1 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontStyle: "italic", fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.02em" }}>
              {t("hero_title_line1")}{" "}<em style={{ color: "#ffffff", fontStyle: "italic" }}>{t("hero_title_line2")}</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.48)", margin: 0 }}>{t("hero_description")}</p>
          </div>
        </div>

        {/* Main */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(16px, 3vw, 32px) 80px" }}>
          <div className="stores-layout">

            {/* Map */}
            <div className="stores-map-col">
              <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.05)", height: "100%", border: "1px solid #f0ebe4" }}>
                <StoresMap stores={stores} activeStore={activeStore} onMarkerClick={setActiveStore} locale={locale} />
              </div>
              <p className="map-zoom-hint" style={{ fontSize: 10.5, color: "#a0a0a0", textAlign: "center", marginTop: 8 }}>
                {isRTL ? "Ctrl + التمرير للتكبير" : "Ctrl + scroll to zoom"}
              </p>
              <p className="map-touch-hint" style={{ fontSize: 10.5, color: "#a0a0a0", textAlign: "center", marginTop: 8 }}>
                {isRTL ? "استخدم إصبعين للتكبير والتحريك" : "Use two fingers to zoom & move"}
              </p>
            </div>

            {/* Store Cards */}
            <div className="stores-list-col">
              {/* Filters */}
              <div className="stores-card" style={{ padding: "16px", cursor: "default", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {cities.map(city => (
                    <button key={city} onClick={() => setActiveCity(city)} className={`stores-filter-btn ${activeCity === city ? "on" : "off"}`}>
                      {cityLabels[city]}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder={t("search_placeholder")} value={search} onChange={e => setSearch(e.target.value)} className="stores-search" />
              </div>

              {/* List */}
              <div className="stores-list-scroll" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredStores.map(store => {
                  const slug = storeSlugMap[store.name];
                  return (
                    <div
                      key={store.name}
                      onClick={() => setActiveStore(store.name)}
                      className={`stores-card ${activeStore === store.name ? "active" : ""}`}
                    >
                      <div style={{ display: "flex" }}>
                        {/* Image */}
                        <div style={{ width: 130, minWidth: 130, overflow: "hidden", position: "relative", borderRadius: "14px 0 0 14px" }}>
                          <img src={getStoreImage(store)} alt={store.name} className="stores-card-img" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,.15) 0%, transparent 50%)" }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, padding: "14px 14px 12px", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a1a", margin: 0, lineHeight: 1.3 }}>
                              {store.name}
                            </h3>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, flexShrink: 0, background: cityConfig[store.city]?.bg || "#f5f7fa", color: cityConfig[store.city]?.color || "#4a4a4a" }}>
                              {store.city}
                            </span>
                          </div>

                          <p style={{ fontSize: 11.5, color: "#7a7a7a", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                            <MapIcon /> {store.address}
                          </p>
                          <p style={{ fontSize: 11.5, color: "#7a7a7a", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                            <ClockIcon /> {store.hours}
                          </p>

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: 6 }}>
                            <a href={"tel:" + store.phone} className="stores-action-btn" style={{ background: "#1C75BC", color: "#fff" }} onClick={e => e.stopPropagation()}>
                              <PhoneIcon /> {t("call")}
                            </a>
                            <a href={"https://wa.me/" + store.whatsapp} target="_blank" rel="noopener noreferrer" className="stores-action-btn" style={{ background: "#25d366", color: "#fff" }} onClick={e => e.stopPropagation()}>
                              <WAIcon /> {t("whatsapp")}
                            </a>
                            <a href={store.maps} target="_blank" rel="noopener noreferrer" className="stores-action-btn" style={{ flex: "0 0 36px", background: "#faf6f2", color: "#c8956c", border: "1px solid #f0e4d8" }} onClick={e => e.stopPropagation()} title={t("directions")}>
                              <MapIcon />
                            </a>
                          </div>

                          {/* View Details Link */}
                          {slug && (
                            <Link href={`/${locale}/stores/${slug}`} className="stores-details-btn" onClick={e => e.stopPropagation()}>
                              {isRTL ? "عرض التفاصيل ←" : "View Details →"}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredStores.length === 0 && (
                  <div className="stores-card" style={{ textAlign: "center", padding: "48px 0", cursor: "default" }}>
                    <p style={{ fontSize: 14, color: "#a0a0a0", margin: 0 }}>
                      {isRTL ? "لا توجد فروع متطابقة" : "No matching stores found"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}