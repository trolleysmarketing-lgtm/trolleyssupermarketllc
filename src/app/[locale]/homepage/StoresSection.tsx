"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FadeUp } from "./FadeUp";
import { HScroll } from "./HScroll";
import { Ico } from "./icons";
import styles from "./homepage.module.css";

const STORE_IMAGES: Record<string, string> = {
  "Trolleys - Mirdif":                    "/store/Mirdif-Dubai.webp",
  "Trolleys - Al Taawun":                 "/store/Al-Taawun-Sharjah.webp",
  "Trolleys - Al Khan":                   "/store/Al-Khan-Sharjah.webp",
  "Trolleys - Al Nuaimia":                "/store/Al-Nuaimia-Ajman.webp",
  "Trolleys Supermarket - Oasis Street":  "/store/oasis-ajman.webp",
  "Mirdif — Dubai":                       "/store/Mirdif-Dubai.webp",
  "Al Taawun — Sharjah":                  "/store/Al-Taawun-Sharjah.webp",
  "Al Khan — Sharjah":                    "/store/Al-Khan-Sharjah.webp",
  "Al Nuaimia — Ajman":                   "/store/Al-Nuaimia-Ajman.webp",
  "مردف — دبي":                           "/store/Mirdif-Dubai.webp",
  "التعاون — الشارقة":                    "/store/Al-Taawun-Sharjah.webp",
  "الخان — الشارقة":                      "/store/Al-Khan-Sharjah.webp",
  "النعيمية — عجمان":                     "/store/Al-Nuaimia-Ajman.webp",
  "تروليز - مردف":                        "/store/Mirdif-Dubai.webp",
  "تروليز - التعاون":                     "/store/Al-Taawun-Sharjah.webp",
  "تروليز - الخان":                       "/store/Al-Khan-Sharjah.webp",
  "تروليز - النعيمية":                    "/store/Al-Nuaimia-Ajman.webp",
  "تروليز سوبرماركت - شارع الواحة":       "/store/oasis-ajman.webp",
};

const STORE_MAPS: Record<string, string> = {
  "Trolleys - Mirdif":                    "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
  "Trolleys - Al Taawun":                 "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
  "Trolleys - Al Khan":                   "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
  "Trolleys - Al Nuaimia":                "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
  "Trolleys Supermarket - Oasis Street":  "https://maps.google.com/?q=25.387256,55.458812",
  "Mirdif — Dubai":                       "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
  "Al Taawun — Sharjah":                  "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
  "Al Khan — Sharjah":                    "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
  "Al Nuaimia — Ajman":                   "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
  "مردف — دبي":                           "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
  "التعاون — الشارقة":                    "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
  "الخان — الشارقة":                      "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
  "النعيمية — عجمان":                     "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
};

interface Store {
  name: string;
  address: string;
  hours: string;
  phone: string;
  wa: string;
  city: string;
}

interface Props {
  locale: string;
  isRTL: boolean;
}

export default function StoresSection({ locale, isRTL }: Props) {
  const t = useTranslations("home");
  const stores = t.raw("stores.list") as Store[];

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
          {stores.map((store, i) => (
            <FadeUp key={store.name} delay={i * 45}>
              <article className={styles.storeCard}>
                <div className={styles.storeImg}>
                  <img
                    src={STORE_IMAGES[store.name] || "/store/oasis-ajman.webp"}
                    alt={store.name}
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding={i < 3 ? "sync" : "async"}
                    width={400}
                    height={300}
                  />
                  <div className={styles.storeImgOverlay} aria-hidden="true" />
                  <span
                    className={styles.storeCityBadge}
                    style={isRTL ? { right: "auto", left: 10 } : undefined}
                  >
                    {store.city}
                  </span>
                  <div
                    className={styles.storeHoursBadge}
                    style={isRTL ? { left: "auto", right: 10 } : undefined}
                  >
                    {Ico.clock()}
                    <time>{store.hours}</time>
                  </div>
                </div>

                <div className={styles.storeBody}>
                  <h3 className={styles.storeName}>{store.name}</h3>
                  <address className={styles.storeAddress}>
                    {Ico.pin()} <span>{store.address}</span>
                  </address>
                  <div className={styles.storeActions}>
                    <a
                      href={`tel:${store.phone}`}
                      className={`${styles.storeBtn} ${styles.storeBtnCall}`}
                      aria-label={`${t("stores.call")} ${store.name}`}
                    >
                      {Ico.phone()} {t("stores.call")}
                    </a>
                    <a
                      href={`https://wa.me/${store.wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.storeBtn} ${styles.storeBtnWa}`}
                      aria-label={`WhatsApp ${store.name}`}
                    >
                      {Ico.wa()} WhatsApp
                    </a>
                    <a
                      href={STORE_MAPS[store.name] || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.storeBtn} ${styles.storeBtnMap}`}
                      aria-label={`${t("stores.map")} ${store.name}`}
                    >
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
