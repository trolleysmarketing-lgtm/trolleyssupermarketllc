import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULES = [
  {
    group: "Content Management",
    color: "#1C75BC",
    items: [
      { href: "/admin/hero",         label: "Hero Slider",      desc: "Homepage slides & CTAs",        dot: "#3b82f6" },
      { href: "/admin/ticker",       label: "Ticker",           desc: "Scrolling announcement bar",    dot: "#0ea5e9" },
      { href: "/admin/announcement", label: "Announcement",     desc: "Site-wide banner message",      dot: "#f59e0b" },
      { href: "/admin/offers",       label: "Offers & Catalog", desc: "Weekly PDF & promotions",       dot: "#1C75BC" },
      { href: "/admin/blog",         label: "Blog Posts",       desc: "Articles in EN & AR",           dot: "#8b5cf6" },
      { href: "/admin/categories",   label: "Categories",       desc: "Product taxonomy",              dot: "#f97316" },
    ],
  },
  {
    group: "Customer Insights",
    color: "#059669",
    items: [
      { href: "/admin/surveys",        label: "Surveys",        desc: "Build feedback forms",          dot: "#059669" },
      { href: "/admin/survey-results", label: "Survey Results", desc: "Charts, exports & responses",  dot: "#0d9488" },
      { href: "/admin/google-business",label: "Google Reviews", desc: "Ratings & branch analytics",   dot: "#e11d48" },
    ],
  },
  {
    group: "Locations",
    color: "#16a34a",
    items: [
      { href: "/admin/stores", label: "Stores", desc: "Hours, photos & branch info", dot: "#16a34a" },
    ],
  },
  {
    group: "System",
    color: "#7c3aed",
    items: [
      { href: "/admin/translations", label: "Translations", desc: "EN / AR content editing", dot: "#7c3aed" },
      { href: "/admin/meta",         label: "SEO / Meta",   desc: "Page titles & descriptions", dot: "#a21caf" },
    ],
  },
];

// ─── Arrow icon ───────────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export default async function AdminDashboard() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  const today = new Date();
  const hour  = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style href="admin-dash" precedence="default">{`
        .dash-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 10px;
          text-decoration: none;
          background: white;
          border: 1px solid #eaecf0;
          transition: border-color .15s, box-shadow .15s, transform .15s;
          color: inherit;
        }
        .dash-item:hover {
          border-color: #d0d5dd;
          box-shadow: 0 4px 12px rgba(0,0,0,.06);
          transform: translateY(-1px);
        }
        .dash-item:hover .dash-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .dash-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity .15s, transform .15s;
          color: #9ca3af;
          margin-left: auto;
          flex-shrink: 0;
        }
        .dash-section {
          background: white;
          border: 1px solid #eaecf0;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .dash-section-header {
          padding: 14px 18px 12px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 4px", fontWeight: 500 }}>{greeting}</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 4px", letterSpacing: "-.3px" }}>
          Trolleys Admin
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          Manage your website content, customer data and store information.
        </p>
      </div>

      {/* ── Quick stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Modules",       value: MODULES.reduce((s,g)=>s+g.items.length,0), color: "#1C75BC", icon: "⚡" },
          { label: "Languages",     value: "EN / AR",                                  color: "#059669", icon: "🌐" },
          { label: "Branches",      value: "4",                                         color: "#f59e0b", icon: "🏪" },
          { label: "System",        value: "Online",                                    color: "#10b981", icon: "✓"  },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #eaecf0", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Module sections ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {MODULES.map(section => (
          <div key={section.group} className="dash-section">
            <div className="dash-section-header">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: section.color, flexShrink: 0, display: "block" }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em" }}>
                {section.group}
              </span>
            </div>
            <div style={{ padding: "10px 10px" }}>
              {section.items.map(item => (
                <Link key={item.href} href={item.href} className="dash-item" style={{ marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{item.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{item.desc}</p>
                  </div>
                  <span className="dash-arrow"><Arrow/></span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#d1d5db" }}>Trolleys Supermarket LLC · Admin Panel</span>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/en" style={{ fontSize: 11, color: "#9ca3af", textDecoration: "none" }}>View Site →</Link>
          <Link href="/ar" style={{ fontSize: 11, color: "#9ca3af", textDecoration: "none" }}>عربي →</Link>
        </div>
      </div>
    </>
  );
}