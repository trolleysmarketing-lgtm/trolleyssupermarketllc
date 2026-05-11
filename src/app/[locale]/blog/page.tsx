// app/[locale]/blog/page.tsx
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

type Post = {
  slug: string;
  title: string;
  title_ar?: string;
  date: string;
  category: string;
  excerpt: string;
  excerpt_ar?: string;
  content: string;
  content_ar?: string;
  coverImage?: string;
};

const blogImages: Record<string, string> = {
  "smart-grocery-shopping-uae-save-money-2026": "/blog/smart-grocery-shopping-uae.webp",
  "healthy-eating-dubai-affordable-supermarket-foods": "/blog/healthy-eating-dubai-supermarket.webp",
  "how-to-choose-fresh-meat-fruits-vegetables-uae": "/blog/fresh-food-uae-supermarket-guide.webp",
  "best-weekly-supermarket-deals-uae-trolleys": "/blog/uae-supermarket-weekly-offers.webp",
  "daily-life-uae-supermarkets-shopping-guide": "/blog/supermarket-lifestyle-uae-dubai.webp",
  "top-imported-foods-uae-supermarkets-trolleys": "/blog/imported-foods-uae-supermarket.webp",
};

const getImage = (post: Post) => post.coverImage || blogImages[post.slug] || "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" 
      ? "المدونة — ترولييز سوبرماركت | نصائح وأفكار تسوق" 
      : "Blog — Trolleys Supermarket UAE | Shopping Tips & Ideas",
    description: locale === "ar"
      ? "اقرأ أحدث المقالات عن التسوق الذكي وتوفير المال ونمط الحياة الصحي من ترولييز سوبرماركت."
      : "Read the latest articles on smart shopping, saving money, and healthy lifestyle from Trolleys Supermarket.",
    openGraph: {
      title: locale === "ar" ? "المدونة — ترولييز سوبرماركت" : "Blog — Trolleys Supermarket UAE",
      description: locale === "ar" ? "نصائح وأفكار تسوق" : "Shopping Tips & Ideas",
      images: ["/blog/blog-og.webp"],
    },
  };
}

async function getPosts(): Promise<Post[]> {
  try {
    const dataPath = path.join(process.cwd(), "data", "blog.json");
    if (!existsSync(dataPath)) return [];
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return data.posts || [];
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogContent posts={posts} />;
}

function BlogContent({ posts }: { posts: Post[] }) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const getTitle = (post: Post) => isRTL && post.title_ar ? post.title_ar : post.title;
  const getExcerpt = (post: Post) => isRTL && post.excerpt_ar ? post.excerpt_ar : post.excerpt;

  const cleanExcerpt = (text: string) => {
    if (!text) return "";
    return text
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/`/g, "")
      .trim()
      .slice(0, 160);
  };

  return (
    <>
      <style>{`
        .cp { font-family: 'Inter', system-ui, sans-serif; }
        .serif { font-family: Georgia, 'Times New Roman', serif; }
        
        .blog-card {
          background: #fff;
          border: 1px solid #f0ebe4;
          border-radius: 16px;
          overflow: hidden;
          transition: all .35s cubic-bezier(.25,.46,.45,.94);
          text-decoration: none;
          display: block;
          height: 100%;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
        }
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.03);
          border-color: #1C75BC;
        }
        .blog-card-img {
          transition: transform .6s cubic-bezier(.25,.46,.45,.94);
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.06);
        }
        
        .blog-featured {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #f0ebe4;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: all .35s cubic-bezier(.25,.46,.45,.94);
          text-decoration: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .blog-featured:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,.07), 0 6px 16px rgba(0,0,0,.04);
        }
        .blog-featured-img {
          transition: transform .7s cubic-bezier(.25,.46,.45,.94);
        }
        .blog-featured:hover .blog-featured-img {
          transform: scale(1.05);
        }
        
        .blog-category-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          background: #e8f4fd;
          color: #1C75BC;
        }
        
        .blog-read-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #1C75BC;
          transition: gap .3s;
        }
        .blog-card:hover .blog-read-more,
        .blog-featured:hover .blog-read-more {
          gap: 10px;
        }

        @keyframes pulse { 
          0%,100%{opacity:.5;transform:scale(1)} 
          50%{opacity:1;transform:scale(1.5)} 
        }

        @media(max-width: 768px) {
          .blog-featured { grid-template-columns: 1fr !important; }
          .blog-featured-content { padding: 28px 24px !important; }
        }
      `}</style>

      <div className="cp" style={{ background: "#fff", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>
        <Breadcrumb locale={locale} crumbs={[{ label: t("breadcrumb") }]} />

        {/* HERO */}
        <div style={{ background: "linear-gradient(135deg, #1C75BC 0%, #1C75BC 100%)", position: "relative", overflow: "hidden", padding: "48px 32px 52px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,149,108,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
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

        {/* CONTENT */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p style={{ fontSize: 15, color: "#a0a0a0", fontWeight: 500 }}>{t("no_posts")}</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              <Link href={`/${locale}/blog/${posts[0].slug}`} className="blog-featured" style={{ marginBottom: 36 }}>
                <div style={{ position: "relative", minHeight: 340, background: "#e8f4fd", overflow: "hidden" }}>
                  {getImage(posts[0]) ? (
                    <img src={getImage(posts[0])} alt={getTitle(posts[0])} className="blog-featured-img" style={{ position: "absolute", top: 0, left: 0, width: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.2" opacity=".3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.25) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", top: 16, left: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 999, background: "#1C75BC", color: "#fff" }}>{t("featured_badge")}</span>
                  </div>
                </div>
                <div className="blog-featured-content" style={{ padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span className="blog-category-badge">{posts[0].category}</span>
                    <span style={{ fontSize: 11.5, color: "#a0a0a0", fontWeight: 500 }}>{posts[0].date}</span>
                  </div>
                  <h2 className="serif" style={{ fontSize: "clamp(18px, 2vw, 26px)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 14 }}>{getTitle(posts[0])}</h2>
                  <p style={{ fontSize: 13.5, color: "#7a7a7a", lineHeight: 1.7, marginBottom: 20 }}>{cleanExcerpt(getExcerpt(posts[0]))}</p>
                  <span className="blog-read-more">{t("read_more")}<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                </div>
              </Link>

              {/* Grid */}
              {posts.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 22 }}>
                  {posts.slice(1).map((post) => (
                    <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="blog-card">
                      <div style={{ position: "relative", height: 220, background: "#e8f4fd", overflow: "hidden" }}>
                        {getImage(post) ? (
                          <img src={getImage(post)} alt={getTitle(post)} className="blog-card-img" style={{ width: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.2" opacity=".3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span className="blog-category-badge">{post.category}</span>
                          <span style={{ fontSize: 11, color: "#a0a0a0", fontWeight: 500 }}>{post.date}</span>
                        </div>
                        <h3 className="serif" style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{getTitle(post)}</h3>
                        <p style={{ fontSize: 12.5, color: "#7a7a7a", lineHeight: 1.65, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cleanExcerpt(getExcerpt(post))}</p>
                        <span className="blog-read-more" style={{ fontSize: 12.5 }}>{t("read_more")}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}