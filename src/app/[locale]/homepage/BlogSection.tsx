"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FadeUp } from "./FadeUp";
import { HScroll } from "./HScroll";
import { Ico } from "./icons";
import styles from "./homepage.module.css";

type Post = {
  slug: string;
  title: string;
  title_ar?: string;
  date: string;
  category: string;
  excerpt: string;
  excerpt_ar?: string;
  coverImage?: string;
};

const BLOG_IMAGES: Record<string, string> = {
  "smart-grocery-shopping-uae-save-money-2026":       "/blog/smart-grocery-shopping-uae.webp",
  "healthy-eating-dubai-affordable-supermarket-foods": "/blog/healthy-eating-dubai-supermarket.webp",
  "how-to-choose-fresh-meat-fruits-vegetables-uae":   "/blog/fresh-food-uae-supermarket-guide.webp",
  "best-weekly-supermarket-deals-uae-trolleys":       "/blog/uae-supermarket-weekly-offers.webp",
  "daily-life-uae-supermarkets-shopping-guide":       "/blog/supermarket-lifestyle-uae-dubai.webp",
  "top-imported-foods-uae-supermarkets-trolleys":     "/blog/imported-foods-uae-supermarket.webp",
};

const getPostImage = (p: Post) => p.coverImage || BLOG_IMAGES[p.slug] || "";

const cleanExcerpt = (text: string) =>
  text
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/\{[\s\S]*?\}/g, "")
    .replace(/`/g, "")
    .trim()
    .slice(0, 110);

function BlogSkeleton() {
  return (
    <div className={styles.skBlog} role="status" aria-label="Loading article">
      <div className={styles.sk} style={{ aspectRatio: "16/9" }} />
      <div style={{ padding: "20px 20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className={styles.sk} style={{ height: 10, width: "28%" }} />
        <div className={styles.sk} style={{ height: 15, width: "100%" }} />
        <div className={styles.sk} style={{ height: 15, width: "82%" }} />
        <div className={styles.sk} style={{ height: 10, width: "30%", marginTop: 4 }} />
      </div>
    </div>
  );
}

interface Props {
  locale: string;
  isRTL: boolean;
}

export default function BlogSection({ locale, isRTL }: Props) {
  const t = useTranslations("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/blog-posts", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setPosts((d.posts || []).slice(0, 3));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => controller.abort();
  }, []);

  return (
    <section className={`${styles.sec} ${styles.secWhite}`} aria-labelledby="blog-heading">
      <div className={styles.wrap}>
        <FadeUp>
          <div className={styles.sh}>
            <div>
              <p className={styles.eyebrow}>{t("blog.subtitle")}</p>
              <h2 id="blog-heading" className={styles.h2}>
                {t("blog.title")} <em>{t("blog.titleHighlight")}</em>
              </h2>
            </div>
            <Link href={`/${locale}/blog`} className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
              {t("blog.viewAll")} {Ico.arrow(isRTL)}
            </Link>
          </div>
        </FadeUp>

        <HScroll itemWidth={390} gap={20} label={t("blog.title")}>
          {loaded && posts.length > 0
            ? posts.map((post, i) => {
                const img = getPostImage(post);
                const title = post.title_ar && locale === "ar" ? post.title_ar : post.title;
                const excerpt = cleanExcerpt(
                  post.excerpt_ar && locale === "ar" ? post.excerpt_ar : post.excerpt
                );
                return (
                  <FadeUp key={post.slug} delay={i * 55}>
                    <article className={styles.blogCard}>
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        aria-label={`${t("blog.readMore")}: ${title}`}
                      >
                        <div className={styles.blogImg}>
                          {img && (
                            <img
                              src={img}
                              alt={title}
                              loading={i === 0 ? "eager" : "lazy"}
                              decoding={i === 0 ? "sync" : "async"}
                              fetchPriority={i === 0 ? "high" : "low"}
                              width={600}
                              height={338}
                            />
                          )}
                          <div className={styles.blogImgOverlay} aria-hidden="true" />
                          {post.category && (
                            <span className={styles.blogCatBadge}>{post.category}</span>
                          )}
                        </div>
                        <div className={styles.blogBody}>
                          <time className={styles.blogDate} dateTime={post.date}>{post.date}</time>
                          <h3 className={styles.blogTitle}>{title}</h3>
                          <p className={styles.blogExcerpt}>{excerpt}</p>
                          <span className={styles.blogReadMore}>
                            {t("blog.readMore")} {Ico.arrow(isRTL)}
                          </span>
                        </div>
                      </Link>
                    </article>
                  </FadeUp>
                );
              })
            : [1, 2, 3].map((i) => <BlogSkeleton key={i} />)
          }
        </HScroll>
      </div>
    </section>
  );
}
