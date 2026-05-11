"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FadeUp } from "./FadeUp";
import { HScroll } from "./HScroll";
import { Ico } from "./icons";
import styles from "./homepage.module.css";

type Category = {
  slug: string;
  name_en: string;
  name_ar: string;
  image: string;
};

function CatCard({ name, img, priority }: { name: string; img: string; priority: boolean }) {
  return (
    <div className={styles.catCard}>
      <img
        src={img || "/categories/placeholder.webp"}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        width={200}
        height={300}
      />
      <div className={styles.catOverlay} aria-hidden="true" />
      <span className={styles.catBadge} aria-hidden="true">Shop</span>
      <div className={styles.catContent}>
        <span className={styles.catLabel}>{name}</span>
        <div className={styles.catArrow} aria-hidden="true">
          <div className={styles.catArrowLine} />
          <div className={styles.catArrowTip} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  locale: string;
  isRTL: boolean;
}

export default function CategoriesSection({ locale, isRTL }: Props) {
  const t = useTranslations("home");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories?public=1")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  // Display name based on locale
  const name = (cat: Category) =>
    locale === "ar" ? cat.name_ar : cat.name_en;

  return (
    <section className={`${styles.sec} ${styles.secAlt}`} aria-labelledby="categories-heading">
      <div className={styles.wrap}>
        <FadeUp>
          <div className={styles.sh}>
            <div>
              <p className={styles.eyebrow}>{t("categories.subtitle")}</p>
              <h2 id="categories-heading" className={styles.h2}>
                {t("categories.title")} <em>{t("categories.titleHighlight")}</em>
              </h2>
            </div>
            <Link href={`/${locale}/offers`} className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
              {t("categories.viewAll")} {Ico.arrow(isRTL)}
            </Link>
          </div>
        </FadeUp>

        {/* Desktop grid */}
        {categories.length > 0 && (
          <div className={styles.catGridDesktop} role="list">
            {categories.map((cat, i) => (
              <FadeUp key={cat.slug} delay={i * 28}>
                <div role="listitem">
                  <Link href={`/${locale}/offers?category=${cat.slug}`} aria-label={name(cat)}>
                    <CatCard name={name(cat)} img={cat.image} priority={i < 6} />
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        )}

        {/* Mobile scroll */}
        {categories.length > 0 && (
          <div className={styles.catGridMobile}>
            <HScroll itemWidth={140} gap={12} label={t("categories.subtitle")}>
              {categories.map((cat, i) => (
                <div key={cat.slug} style={{ width: 140, flexShrink: 0, scrollSnapAlign: "start" }}>
                  <Link href={`/${locale}/offers?category=${cat.slug}`} aria-label={name(cat)}>
                    <CatCard name={name(cat)} img={cat.image} priority={i < 4} />
                  </Link>
                </div>
              ))}
            </HScroll>
          </div>
        )}
      </div>
    </section>
  );
}