import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const MODULES = [
  {
    href: "/admin/hero",
    label: "Hero Slider",
    desc: "Manage homepage slides & CTAs",
    color: "#1C75BC", bg: "#eff6ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M1 12h2M21 12h2"/>
      </svg>
    ),
  },
  {
    href: "/admin/ticker",
    label: "Ticker",
    desc: "Homepage scrolling announcement",
    color: "#0284c7", bg: "#f0f9ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="9" width="20" height="6" rx="3"/><path d="M20 6l2 3-2 3M4 6L2 9l2 3"/>
      </svg>
    ),
  },
  {
    href: "/admin/announcement",
    label: "Announcement",
    desc: "Site-wide banner message",
    color: "#d97706", bg: "#fffbeb",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round">
        <path d="M22 17H2a3 3 0 000 6h20"/><path d="M6 5l1.5 4M18 5l-1.5 4"/>
      </svg>
    ),
  },
  {
    href: "/admin/offers",
    label: "Offers & Catalog",
    desc: "Weekly PDF & promotions",
    color: "#1C75BC", bg: "#eff6ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C75BC" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
      </svg>
    ),
  },
  {
    href: "/admin/blog",
    label: "Blog Posts",
    desc: "Articles in English & Arabic",
    color: "#7c3aed", bg: "#f5f3ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    desc: "Product taxonomy management",
    color: "#f97316", bg: "#fff7ed",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/admin/surveys",
    label: "Surveys",
    desc: "Build customer feedback forms",
    color: "#0891b2", bg: "#ecfeff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: "/admin/survey-results",
    label: "Survey Results",
    desc: "Charts, responses & CSV export",
    color: "#0d9488", bg: "#f0fdfa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    href: "/admin/google-business",
    label: "Google Business",
    desc: "Ratings & branch analytics",
    color: "#e11d48", bg: "#fff1f2",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    href: "/admin/stores",
    label: "Stores",
    desc: "Branch info, hours & photos",
    color: "#16a34a", bg: "#f0fdf4",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/admin/translations",
    label: "Translations",
    desc: "EN / AR content management",
    color: "#059669", bg: "#f0fdf4",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
      </svg>
    ),
  },
  {
    href: "/admin/meta",
    label: "SEO / Meta",
    desc: "Page titles & descriptions",
    color: "#a21caf", bg: "#fdf4ff",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a21caf" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
];

export default async function AdminDashboard() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style href="adash" precedence="default">{`
        .mod-card {
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: box-shadow .18s, border-color .18s, transform .18s;
          position: relative;
          overflow: hidden;
        }
        .mod-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
          border-color: #d1d5db;
          transform: translateY(-2px);
        }
        .mod-card:hover .mod-arrow {
          opacity: 1;
          transform: translate(0, 0);
        }
        .mod-arrow {
          position: absolute;
          bottom: 16px;
          right: 16px;
          opacity: 0;
          transform: translate(-4px, 4px);
          transition: opacity .18s, transform .18s;
          color: #9ca3af;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 2px", fontWeight: 500 }}>{greeting}</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 6px", letterSpacing: "-.4px" }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          Here's what you can manage today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 36 }}>
        {[
          { label: "Total Modules",  value: MODULES.length, icon: "⚡", color: "#1C75BC" },
          { label: "Languages",      value: "EN + AR",      icon: "🌐", color: "#059669" },
          { label: "Branches",       value: "4 Locations",  icon: "🏪", color: "#f59e0b" },
          { label: "Status",         value: "All Systems",  icon: "✅", color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 14px" }}>
          All Modules
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {MODULES.map(m => (
            <Link key={m.href} href={m.href} className="mod-card">
              {/* Icon */}
              <div style={{ width: 42, height: 42, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, flexShrink: 0 }}>
                {m.icon}
              </div>
              {/* Text */}
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.5, paddingRight: 20 }}>{m.desc}</p>
              {/* Arrow */}
              <span className="mod-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}