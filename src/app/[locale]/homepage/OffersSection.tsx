"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FadeUp } from "./FadeUp";
import { Ico } from "./icons";
import OffersMiniFlipbook from "@/components/OffersMiniFlipbook";
import styles from "./homepage.module.css";

interface Props {
  locale: string;
  isRTL: boolean;
}

export default function OffersSection({ locale, isRTL }: Props) {
  const t = useTranslations("home");

  return (
    <section className={`${styles.sec} ${styles.secWhite}`} aria-labelledby="offers-heading">
      <div className={styles.wrap}>
        <div className={styles.offersGrid}>

          <FadeUp>
            <div>
              <p className={styles.eyebrow}>{t("offers.subtitle")}</p>
              <h2 id="offers-heading" className={styles.h2} style={{ marginBottom: 14 }}>
                {t("offers.title")} <em>{t("offers.titleHighlight")}</em>
              </h2>
              <p className={styles.lead} style={{ marginBottom: 28 }}>
                {t("offers.description")}
              </p>

              <div className={styles.checkList} role="list">
                {[
                 
                ].map((item, i) => (
                  <div key={i} className={styles.checkItem} role="listitem">
                    <div className={styles.checkIcon} aria-hidden="true">{Ico.check()}</div>
                    <span className={styles.checkText}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btn} ${styles.btnWa}`}
                >
                  {Ico.wa()} {t("offers.joinWhatsApp")}
                </a>
                <Link href={`/${locale}/offers`} className={`${styles.btn} ${styles.btnOutline}`}>
                  {t("offers.browseCatalog")} {Ico.arrow(isRTL)}
                </Link>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <div className={styles.flipbookShell}>
              <div className={styles.flipbookHeader}>
                <div className={styles.livePill}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  {t("offers.weeklyCatalog")}
                </div>
                <Link href={`/${locale}/offers`} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
                  {t("offers.fullView")} {Ico.arrow(isRTL)}
                </Link>
              </div>
              <OffersMiniFlipbook locale={locale} />
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  );
}
