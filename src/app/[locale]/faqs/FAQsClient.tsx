"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

type FAQ = {
  q: string;
  a: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  faqs: FAQ[];
};

// Brand Colors
const BRAND = {
  blue: "#1C75BC",
  blueHover: "#155a8e",
  red: "#DB2B2C",
  redHover: "#c42021",
  gold: "#c8956c",
  goldLight: "#d4a87c",
  goldPale: "#faf6f2",
};

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{
      transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
      transform: open ? "rotate(180deg)" : "none",
      flexShrink: 0
    }}
  >
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

function AccordionItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: `1px solid ${open ? BRAND.gold : "#f0ebe4"}`,
        overflow: "hidden",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: open ? "0 8px 32px rgba(0,0,0,0.05)" : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
          padding: "18px 22px", background: "none",
          border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{
            width: 30, height: 30, borderRadius: "50%",
            background: open ? BRAND.blue : BRAND.goldPale,
            color: open ? "#fff" : BRAND.gold,
            fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            transition: "background 0.25s, color 0.25s",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {index + 1}
          </span>
          <span style={{
            fontSize: 14.5, fontWeight: 600, color: "#1a1a1a",
            lineHeight: 1.4,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {faq.q}
          </span>
        </div>
        <span style={{
          color: open ? BRAND.gold : "#a0a0a0",
          transition: "color 0.25s"
        }}>
          <IconChevron open={open} />
        </span>
      </button>

      <div style={{
        maxHeight: open ? 400 : 0,
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          padding: "0 22px 20px 66px",
          fontSize: 13.5, color: "#7a7a7a", lineHeight: 1.85,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {faq.a}
        </div>
      </div>
    </div>
  );
}

export default function FAQsClient() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [activeCategory, setActiveCategory] = useState("general");
  const [search, setSearch] = useState("");

  const categories: Category[] = isAr ? [
    {
      id: "general", label: "عام",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      faqs: [
        { q: "ما هي ترولييز سوبرماركت؟", a: "ترولييز سوبرماركت هي سلسلة سوبرماركت رائدة في الإمارات العربية المتحدة. لدينا 4 فروع في دبي والشارقة وعجمان، ونقدم أطازج المنتجات الغذائية بأفضل الأسعار مع خدمة توصيل سريعة." },
        { q: "أين تقع فروع ترولييز؟", a: "لدينا 4 فروع: مردف دبي (مركز جولدن جيت)، التعاون الشارقة، الخان الشارقة، والنعيمية عجمان. جميع الفروع مفتوحة يومياً من الساعة 7 صباحاً." },
        { q: "ما هي ساعات العمل؟", a: "جميع الفروع تفتح من الساعة 7 صباحاً. فرع التعاون يغلق الساعة 3 صباحاً، بينما تغلق فروع مردف والخان والنعيمية الساعة 2 صباحاً. نعمل 7 أيام في الأسبوع." },
        { q: "هل ترولييز متاح على وسائل التواصل الاجتماعي؟", a: "نعم! يمكنك متابعتنا على إنستغرام وفيسبوك وتيك توك باسم @trolleysuae. كما يمكنك الانضمام إلى قناة الواتساب الرسمية لتلقي العروض الأسبوعية مجاناً." },
      ],
    },
    {
      id: "offers", label: "العروض",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg>,
      faqs: [
        { q: "متى يصدر الكتالوج الأسبوعي؟", a: "يصدر الكتالوج الأسبوعي كل أسبوع ويكون متاحاً على الموقع الإلكتروني وقناة الواتساب. الأعضاء في القناة يحصلون على الكتالوج فور نشره." },
        { q: "كيف أحصل على العروض الأسبوعية؟", a: "انضم إلى قناة ترولييز على واتساب مجاناً وستحصل على الكتالوج الأسبوعي والعروض الحصرية فور صدورها." },
        { q: "هل يمكنني تصفح الكتالوج إلكترونياً؟", a: "نعم! يمكنك تصفح الكتالوج الأسبوعي بشكل تفاعلي عبر صفحة العروض على موقعنا." },
        { q: "هل العروض سارية في جميع الفروع؟", a: "نعم، جميع العروض الأسبوعية سارية في جميع فروعنا الأربعة في دبي والشارقة وعجمان." },
      ],
    },
    {
      id: "delivery", label: "التوصيل",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      faqs: [
        { q: "هل ترولييز يوصل للمنازل؟", a: "نعم! نوصل طلباتك إلى منزلك في دبي والشارقة وعجمان. تواصل مع أقرب فرع عبر واتساب لتقديم طلبك." },
        { q: "كم يستغرق وقت التوصيل؟", a: "نستهدف التوصيل خلال ساعتين من استلام الطلب. قد يختلف الوقت حسب المنطقة وحجم الطلب." },
        { q: "ما هي مناطق التوصيل؟", a: "نغطي مناطق واسعة في دبي والشارقة وعجمان. للاستفسار عن منطقتك، تواصل مع أقرب فرع." },
        { q: "هل يمكنني الطلب عبر تلبات؟", a: "نعم! ترولييز متوفر على منصة تلبات للتوصيل السريع." },
      ],
    },
    {
      id: "products", label: "المنتجات",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
      faqs: [
        { q: "هل المنتجات طازجة يومياً؟", a: "نعم! نحرص على تجديد منتجاتنا الطازجة يومياً من الخضروات والفواكه واللحوم ومنتجات الألبان." },
        { q: "هل تتوفر منتجات عضوية؟", a: "نعم، لدينا قسم مخصص للمنتجات العضوية يشمل الخضروات والفواكه ومنتجات الألبان." },
        { q: "هل تتوفر منتجات مستوردة؟", a: "بالتأكيد! نوفر تشكيلة واسعة من المنتجات المستوردة من أوروبا وآسيا وأمريكا." },
        { q: "هل المنتجات حلال معتمدة؟", a: "نعم، جميع منتجات اللحوم والدواجن لدينا حلال معتمدة." },
      ],
    },
  ] : [
    {
      id: "general", label: "General",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      faqs: [
        { q: "What is Trolleys Supermarket?", a: "Trolleys Supermarket is a leading supermarket chain in the UAE. With 4 branches across Dubai, Sharjah and Ajman, we offer the freshest groceries at great prices with fast delivery." },
        { q: "Where are Trolleys branches located?", a: "We have 4 branches: Mirdif Dubai (Golden Gate Shopping Centre), Al Taawun Sharjah, Al Khan Sharjah, and Al Nuaimia Ajman. All open daily from 7AM." },
        { q: "What are the opening hours?", a: "All branches open at 7AM. Al Taawun closes at 3AM, others close at 2AM — 7 days a week." },
        { q: "Is Trolleys on social media?", a: "Yes! Follow us on Instagram, Facebook, and TikTok @trolleysuae. Join our WhatsApp Channel for free weekly offers." },
      ],
    },
    {
      id: "offers", label: "Offers",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg>,
      faqs: [
        { q: "When is the weekly catalog published?", a: "The weekly catalog is published every week on our website and WhatsApp Channel. Channel members get it first." },
        { q: "How do I get the weekly offers?", a: "Join our free WhatsApp Channel and receive the weekly catalog and exclusive deals straight to your phone." },
        { q: "Can I browse the catalog online?", a: "Yes! Browse the weekly catalog interactively on our Offers page with the digital flipbook experience." },
        { q: "Are offers valid in all branches?", a: "Yes, all weekly offers are valid across all 4 branches in Dubai, Sharjah and Ajman." },
      ],
    },
    {
      id: "delivery", label: "Delivery",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      faqs: [
        { q: "Does Trolleys deliver?", a: "Yes! We deliver across Dubai, Sharjah and Ajman. Contact your nearest branch via WhatsApp to place your order." },
        { q: "How long does delivery take?", a: "We aim to deliver within 2 hours. Times may vary by area and order size." },
        { q: "Which areas do you cover?", a: "We cover wide areas across Dubai, Sharjah and Ajman. Contact your nearest branch for specifics." },
        { q: "Can I order via Talabat?", a: "Yes! Trolleys Supermarket is available on Talabat for quick and convenient delivery." },
      ],
    },
    {
      id: "products", label: "Products",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
      faqs: [
        { q: "Are products fresh daily?", a: "Absolutely! We restock our fresh produce, meat, dairy and bakery items daily for maximum freshness." },
        { q: "Do you stock organic products?", a: "Yes, we have a dedicated organic section with certified organic vegetables, fruits and dairy." },
        { q: "Are imported products available?", a: "Definitely! We stock products from Europe, Asia and the Americas for the UAE's diverse community." },
        { q: "Are meat products Halal certified?", a: "Yes, all our meat and poultry are Halal certified and meet Islamic dietary requirements." },
      ],
    },
  ];

  const activeCat = categories.find(c => c.id === activeCategory)!;

  const filteredFaqs = search.trim()
    ? categories.flatMap(c => c.faqs).filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
      )
    : activeCat.faqs;

  return (
    <>
      <style>{`
        .faq-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #fdfbf9;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .faq-serif {
          font-family: Georgia, 'Times New Roman', serif;
        }
        .faq-cat-btn {
          transition: all 0.25s cubic-bezier(.25,.46,.45,.94);
          cursor: pointer;
          border: none;
        }
        .faq-cat-btn:hover {
          transform: translateY(-1px);
        }
        .faq-search-input:focus {
          border-color: rgba(255,255,255,.3) !important;
          background: rgba(255,255,255,.15) !important;
        }

        @media(max-width: 768px) {
          .faq-layout { flex-direction: column !important; }
          .faq-sidebar { width: 100% !important; position: static !important; }
        }
      `}</style>

      <div className="faq-page" dir={isAr ? "rtl" : "ltr"}>
        <Breadcrumb locale={locale} crumbs={[{ label: isAr ? "الأسئلة الشائعة" : "FAQs" }]} />

        {/* ════════════ HERO - Marka Mavisi ════════════ */}
        <section style={{
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blue} 100%)`,
          position: "relative", overflow: "hidden",
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
            maxWidth: 700, margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 40px)",
            textAlign: "center", position: "relative", zIndex: 1
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
                animation: "faqPulse 2s ease-in-out infinite"
              }} />
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: ".12em",
                textTransform: "uppercase", color: "#ffffff"
              }}>
                {isAr ? "مركز المساعدة" : "Help Center"}
              </span>
            </div>

            <h1 className="faq-serif" style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontStyle: "italic",
              fontWeight: 400, color: "#fff",
              lineHeight: 1.12, letterSpacing: "-.02em",
              margin: "0 0 12px"
            }}>
              {isAr ? "الأسئلة الشائعة" : "Frequently Asked"}{" "}
              <em style={{ color: "#ffffff", fontStyle: "italic" }}>
                {isAr ? "عن ترولييز" : "Questions"}
              </em>
            </h1>

            <p style={{
              fontSize: 14, color: "rgba(255,255,255,.48)",
              lineHeight: 1.7, maxWidth: 460,
              marginLeft: "auto", marginRight: "auto", marginBottom: 24
            }}>
              {isAr
                ? "كل ما تحتاج معرفته عن العروض، التوصيل، الفروع والمنتجات."
                : "Everything about offers, delivery, branches and products."}
            </p>

            {/* Search */}
            <div style={{ position: "relative", maxWidth: 460, margin: "0 auto" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" style={{
                position: "absolute", left: isAr ? "auto" : 18, right: isAr ? 18 : "auto",
                top: "50%", transform: "translateY(-50%)", pointerEvents: "none"
              }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="faq-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? "ابحث في الأسئلة..." : "Search questions..."}
                style={{
                  width: "100%", padding: isAr ? "13px 48px 13px 18px" : "13px 18px 13px 48px",
                  borderRadius: 999, border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.06)", color: "#fff",
                  fontSize: 13.5, outline: "none",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: "all .25s"
                }}
              />
            </div>
          </div>
        </section>

        {/* ════════════ CONTENT ════════════ */}
        <section style={{ padding: "48px 0 80px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px, 3vw, 32px)" }}>
            <div className="faq-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
              {/* Sidebar */}
              <div className="faq-sidebar" style={{
                width: 220, flexShrink: 0, position: "sticky", top: 80
              }}>
                <p style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em",
                  textTransform: "uppercase", color: "#a0a0a0", marginBottom: 10
                }}>
                  {isAr ? "الفئات" : "Categories"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className="faq-cat-btn"
                      onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: 10, fontSize: 12.5,
                        fontWeight: 600, width: "100%", textAlign: "left",
                        background: activeCategory === cat.id && !search ? BRAND.blue : "#fff",
                        color: activeCategory === cat.id && !search ? "#fff" : "#4a4a4a",
                        border: activeCategory === cat.id && !search ? "none" : "1px solid #f0ebe4",
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      <span style={{ opacity: activeCategory === cat.id && !search ? .9 : .5 }}>
                        {cat.icon}
                      </span>
                      {cat.label}
                      <span style={{
                        marginLeft: "auto", fontSize: 10, fontWeight: 700,
                        background: activeCategory === cat.id && !search ? "rgba(255,255,255,.15)" : BRAND.goldPale,
                        color: activeCategory === cat.id && !search ? "#fff" : BRAND.gold,
                        padding: "2px 8px", borderRadius: 999,
                      }}>
                        {cat.faqs.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Contact CTA */}
                <div style={{
                  marginTop: 24, padding: "18px 16px",
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #f0ebe4"
                }}>
                  <p style={{
                    fontSize: 12.5, fontWeight: 700, color: "#1a1a1a",
                    marginBottom: 4
                  }}>
                    {isAr ? "لم تجد إجابتك؟" : "Still have questions?"}
                  </p>
                  <p style={{
                    fontSize: 11.5, color: "#a0a0a0",
                    marginBottom: 14, lineHeight: 1.5
                  }}>
                    {isAr ? "تواصل معنا مباشرة" : "Contact us directly"}
                  </p>
                  <Link href={`/${locale}/contact`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 6, background: BRAND.blue, color: "#fff",
                      padding: "10px 16px", borderRadius: 10,
                      fontSize: 12, fontWeight: 600, textDecoration: "none",
                      transition: "all .25s"
                    }}>
                    {isAr ? "اتصل بنا" : "Contact Us"}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* FAQ List */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {search ? (
                  <p style={{
                    fontSize: 12.5, color: "#a0a0a0", marginBottom: 18, fontWeight: 500
                  }}>
                    {isAr
                      ? `${filteredFaqs.length} نتيجة لـ "${search}"`
                      : `${filteredFaqs.length} results for "${search}"`}
                  </p>
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 22
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: BRAND.goldPale, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: BRAND.gold
                    }}>
                      {activeCat.icon}
                    </div>
                    <div>
                      <h2 className="faq-serif" style={{
                        fontSize: 18, fontWeight: 700, color: "#1a1a1a",
                        margin: 0, letterSpacing: "-.01em"
                      }}>
                        {activeCat.label}
                      </h2>
                      <p style={{ fontSize: 11.5, color: "#a0a0a0", margin: 0 }}>
                        {activeCat.faqs.length} {isAr ? "سؤال" : "questions"}
                      </p>
                    </div>
                  </div>
                )}

                {filteredFaqs.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 0",
                    background: "#fff", borderRadius: 16,
                    border: "1px solid #f0ebe4"
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: BRAND.goldPale, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BRAND.gold} strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 14, color: "#a0a0a0", fontWeight: 500 }}>
                      {isAr ? "لا توجد نتائج" : "No results found"}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredFaqs.map((faq, i) => (
                      <AccordionItem key={i} faq={faq} index={i} />
                    ))}
                  </div>
                )}

              
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes faqPulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </>
  );
}