"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { FadeUp } from "./FadeUp";
import { HScroll } from "./HScroll";
import { Ico } from "./icons";
import styles from "./homepage.module.css";

const FALLBACK_IMAGES: Record<string, string> = {
  "Trolleys - Mirdif":       "/store/Mirdif-Dubai.webp",
  "Trolleys - Al Taawun":    "/store/Al-Taawun-Sharjah.webp",
  "Trolleys - Al Khan":      "/store/Al-Khan-Sharjah.webp",
  "Trolleys - Al Nuaimiya":  "/store/Al-Nuaimia-Ajman.webp",
  "Trolleys - Oasis Street": "/store/oasis-ajman.webp",
};

const FALLBACK_MAPS: Record<string, string> = {
  "Trolleys - Mirdif":       "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
  "Trolleys - Al Taawun":    "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
  "Trolleys - Al Khan":      "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
  "Trolleys - Al Nuaimiya":  "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
  "Trolleys - Oasis Street": "https://maps.google.com/?q=25.387256,55.458812",
};

type Store = {
  name: string; city: string; address: string;
  phone: string; whatsapp: string; maps: string;
  hours: string; lat: number; lng: number; image?: string;
};

function getStoreImage(store: Store): string {
  if (store.image) return store.image;
  return FALLBACK_IMAGES[store.name] || "/store/oasis-ajman.webp";
}

interface Props { locale: string; isRTL: boolean; }

export default function StoresSection({ locale, isRTL }: Props) {
  const t = useTranslations("home");
  const [stores, setStores] = useState<Store[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/stores")
      .then(r => r.json())
      .then(d => setStores(d.stores?.length > 0 ? d.stores : null))
      .catch(() => setStores(null));
  }, []);

  // Fallback to translation data
  const translationStores = t.raw("stores.list") as Array<{
    name: string; address: string; hours: string; phone: string; wa: string; city: string;
  }>;

  const displayStores: Store[] = stores ?? translationStores.map(s => ({
    name: s.name, city: s.city, address: s.address,
    phone: s.phone, whatsapp: s.wa, maps: FALLBACK_MAPS[s.name] || "#",
    hours: s.hours, lat: 0, lng: 0,
  }));

  return (
    <section className={`${styles.sec} ${styles.secAlt}`} aria-labelledby="stores-heading">
      <div className={styles.wrap}>
        <FadeUp>
          <div className={`${styles.sh} ${styles.shCenter}`}>
            <p className={`${styles.eyebrow} ${styles.eyebrowCenter}`}>{t("stores.subtitle")}</p>
            <h2 id="stores-heading" className={styles.h2} style={{ textAlign: "center" }}>
              {t("stores.title")} <em>{t("stores.titleHighlight")}</em>
            </h2>
          </div>
        </FadeUp>

        <HScroll itemWidth={295} gap={20} label={t("stores.title")}>
          {displayStores.map((store, i) => (
            <FadeUp key={store.name} delay={i * 45}>
              <article className={styles.storeCard}>
                <div className={styles.storeImg}>
                  <img
                    src={getStoreImage(store)}
                    alt={store.name}
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding={i < 3 ? "sync" : "async"}
                    width={400} height={300}
                  />
                  <div className={styles.storeImgOverlay} aria-hidden="true" />
                  <span className={styles.storeCityBadge} style={isRTL ? { right: "auto", left: 10 } : undefined}>
                    {store.city}
                  </span>
                  <div className={styles.storeHoursBadge} style={isRTL ? { left: "auto", right: 10 } : undefined}>
                    {Ico.clock()} <time>{store.hours}</time>
                  </div>
                </div>
                <div className={styles.storeBody}>
                  <h3 className={styles.storeName}>{store.name}</h3>
                  <address className={styles.storeAddress}>{Ico.pin()} <span>{store.address}</span></address>
                  <div className={styles.storeActions}>
                    <a href={`tel:${store.phone}`} className={`${styles.storeBtn} ${styles.storeBtnCall}`} aria-label={`${t("stores.call")} ${store.name}`}>
                      {Ico.phone()} {t("stores.call")}
                    </a>
                    <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${styles.storeBtn} ${styles.storeBtnWa}`} aria-label={`WhatsApp ${store.name}`}>
                      {Ico.wa()} WhatsApp
                    </a>
                    <a href={store.maps || FALLBACK_MAPS[store.name] || "#"} target="_blank" rel="noopener noreferrer" className={`${styles.storeBtn} ${styles.storeBtnMap}`} aria-label={`${t("stores.map")} ${store.name}`}>
                      {Ico.pin()} {t("stores.map")}
                    </a>
                  </div>
                </div>
              </article>
            </FadeUp>
          ))}
        </HScroll>

        <FadeUp delay={120}>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href={`/${locale}/stores`} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
              {t("stores.viewAll")} {Ico.arrow(isRTL)}
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}