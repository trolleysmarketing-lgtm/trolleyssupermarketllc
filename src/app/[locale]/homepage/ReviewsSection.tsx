"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FadeUp } from "./FadeUp";
import { HScroll } from "./HScroll";
import { Ico } from "./icons";
import styles from "./homepage.module.css";

type Review = {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo?: string;
  branch?: string;
};

function ReviewSkeleton() {
  return (
    <div className={styles.skCard} role="status" aria-label="Loading review">
      <div className={styles.sk} style={{ height: 12, width: "40%", marginBottom: 6 }} />
      <div className={styles.sk} style={{ height: 10, width: "100%", marginBottom: 6 }} />
      <div className={styles.sk} style={{ height: 10, width: "90%",  marginBottom: 6 }} />
      <div className={styles.sk} style={{ height: 10, width: "60%",  marginBottom: 18 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className={styles.sk} style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className={styles.sk} style={{ height: 10, width: "50%" }} />
          <div className={styles.sk} style={{ height: 9,  width: "35%" }} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  locale: string;
}

export default function ReviewsSection({ locale: _locale }: Props) {
  const t = useTranslations("home");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/gmb/places", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        const all: Review[] = (d.branches || []).flatMap((b: any) =>
          (b.reviews || [])
            .filter((r: any) => r.rating >= 4)
            .map((r: any) => ({
              ...r,
              branch: b.name?.split("—")[0]?.trim() || b.city,
            }))
        );
        setReviews(all.sort((a, b) => b.rating - a.rating).slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const isGoogleReviews = reviews.length > 0;
  const displayReviews = isGoogleReviews
    ? reviews
    : (t.raw("reviews.items") as Review[]);

  return (
    <section className={`${styles.sec} ${styles.secAlt}`} aria-labelledby="reviews-heading">
      <div className={styles.wrap}>
        <FadeUp>
          <div className={styles.sh}>
            <div>
              <p className={styles.eyebrow}>{t("reviews.subtitle")}</p>
              <h2 id="reviews-heading" className={styles.h2}>
                {t("reviews.title")} <em>{t("reviews.titleHighlight")}</em>
              </h2>
            </div>

            <div
              className={styles.ratingBlock}
              aria-label={`Rating: ${t("reviews.rating")} out of 5`}
            >
              <p className={styles.ratingNumber}>{t("reviews.rating")}</p>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => <span key={i}>{Ico.star()}</span>)}
                <span className={styles.ratingOutOf}>{t("reviews.ratingOutOf")}</span>
              </div>
              {isGoogleReviews && (
                <div className={styles.ratingSource}>
                  {Ico.google()}
                  <span className={styles.ratingSourceLabel}>{t("reviews.googleReviews")}</span>
                </div>
              )}
            </div>
          </div>
        </FadeUp>

        {loading ? (
          <HScroll itemWidth={340} gap={20} label="Loading reviews">
            {[1, 2, 3, 4, 5, 6].map((i) => <ReviewSkeleton key={i} />)}
          </HScroll>
        ) : (
          <HScroll itemWidth={360} gap={20} label={t("reviews.title")}>
            {displayReviews.slice(0, 6).map((r, i) => (
              <FadeUp key={i} delay={i * 45}>
                <article className={styles.rvCard}>
                  <div className={styles.rvQuote} aria-hidden="true">"</div>
                  <div
                    className={styles.rvStars}
                    role="img"
                    aria-label={`${r.rating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, j) => <span key={j}>{Ico.star(j < r.rating)}</span>)}
                  </div>
                  <blockquote className={styles.rvText}>
                    <p>{r.text.length > 175 ? r.text.slice(0, 172) + "…" : r.text}</p>
                  </blockquote>
                  <div className={styles.rvDivider} aria-hidden="true" />
                  <div className={styles.rvFooter}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {r.photo ? (
                        <img src={r.photo} alt={r.author} className={styles.rvAvatar} width={38} height={38} />
                      ) : (
                        <div className={styles.rvInitials} aria-hidden="true">
                          {r.author[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <cite className={styles.rvName}>{r.author}</cite>
                        {r.branch && <p className={styles.rvBranch}>{r.branch}</p>}
                      </div>
                    </div>
                    {isGoogleReviews && Ico.google()}
                  </div>
                </article>
              </FadeUp>
            ))}
          </HScroll>
        )}
      </div>
    </section>
  );
}
