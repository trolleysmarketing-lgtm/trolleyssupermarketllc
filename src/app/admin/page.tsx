import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const navCards = [
  {
    href: "/admin/hero",
    title: "Hero Slider",
    description: "Manage homepage hero slides (EN/AR)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M16 3l4 4-4 4" /><path d="M8 3L4 7l4 4" />
      </svg>
    ),
    bg: "#eff6ff",
  },
  {
    href: "/admin/offers",
    title: "Offers & Catalog",
    description: "Upload weekly PDF catalog, manage short links",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
    bg: "#eff6ff",
  },
  {
  href: "/admin/ticker",
  title: "Ticker / Marquee",
  description: "Manage homepage scrolling banner (EN/AR)",
  icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  bg: "#eff6ff",
},
{
  href: "/admin/announcement",
  title: "Announcement",
  description: "Show/hide banner with custom message (EN/AR)",
  icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="1.8" strokeLinecap="round">
      <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z"/>
      <path d="M22 11V7a2 2 0 00-2-2H4a2 2 0 00-2 2v4"/>
    </svg>
  ),
  bg: "#eff6ff",
},
{
  href: "/admin/survey-results",
  title: "Survey Results",
  description: "View charts, responses and export CSV",
  icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  bg: "#ecfeff",
},
  {
    href: "/admin/blog",
    title: "Blog Posts",
    description: "Add, edit and delete blog articles (EN/AR)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    bg: "#f5f3ff",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    description: "Manage product categories and taxonomies",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    bg: "#fffbeb",
  },
  {
    href: "/admin/surveys",
    title: "Surveys",
    description: "Create and manage customer feedback surveys",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    bg: "#ecfeff",
  },
  {
    href: "/admin/stores",
    title: "Stores",
    description: "Update store information and locations",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    bg: "#f0fdf4",
  },
  {
    href: "/admin/google-business",
    title: "Google Business",
    description: "Monitor reviews, ratings & branch performance",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#de2b2e" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    bg: "#fff1f2",
  },
];

export default async function AdminDashboard() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  return (
    <div>
      <style href="admin-dashboard" precedence="default">{`
        .admin-dashboard-card {
          background: white;
          border-radius: 18px;
          padding: 24px 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          text-decoration: none;
          display: block;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s;
        }
        .admin-dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
          Dashboard
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Welcome back! Manage your website content below.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
      }}>
        {navCards.map((card) => (
          <Link key={card.href} href={card.href} className="admin-dashboard-card">
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: card.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              {card.icon}
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {card.title}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}