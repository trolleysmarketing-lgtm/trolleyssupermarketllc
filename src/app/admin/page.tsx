import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const navCards = [
  {
    href: "/admin/hero",
    title: "Hero Slider",
    description: "Manage homepage hero slides (EN/AR)",
    bg: "#eff6ff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="12" rx="3" fill="#dbeafe" stroke="#1C75BC" strokeWidth="1.5"/>
        <circle cx="7" cy="12" r="2" fill="#1C75BC" opacity="0.7"/>
        <rect x="11" y="10.5" width="8" height="1.5" rx="0.75" fill="#1C75BC" opacity="0.6"/>
        <rect x="11" y="13" width="5" height="1.5" rx="0.75" fill="#1C75BC" opacity="0.4"/>
        <path d="M1 12h2M21 12h2" stroke="#1C75BC" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/ticker",
    title: "Ticker / Marquee",
    description: "Manage homepage scrolling banner (EN/AR)",
    bg: "#f0f9ff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="9" width="20" height="6" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5"/>
        <rect x="5" y="11" width="6" height="2" rx="1" fill="#0284c7" opacity="0.8"/>
        <rect x="13" y="11" width="4" height="2" rx="1" fill="#0284c7" opacity="0.4"/>
        <path d="M20 6l2 3-2 3M4 6L2 9l2 3" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/announcement",
    title: "Announcement",
    description: "Show/hide banner with custom message (EN/AR)",
    bg: "#fef9c3",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="8" width="20" height="8" rx="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5"/>
        <circle cx="7" cy="12" r="1.5" fill="#ca8a04"/>
        <rect x="10" y="11" width="8" height="1.5" rx="0.75" fill="#ca8a04" opacity="0.6"/>
        <rect x="10" y="13.5" width="5" height="1.5" rx="0.75" fill="#ca8a04" opacity="0.4"/>
        <path d="M6 5l1.5 3M18 5l-1.5 3" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/offers",
    title: "Offers & Catalog",
    description: "Upload weekly PDF catalog, manage short links",
    bg: "#eff6ff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="14" height="18" rx="2.5" fill="#dbeafe" stroke="#1C75BC" strokeWidth="1.5"/>
        <path d="M7 8h6M7 11h6M7 14h4" stroke="#1C75BC" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="18" r="4.5" fill="#1C75BC"/>
        <path d="M18 16v4M16 18h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/blog",
    title: "Blog Posts",
    description: "Add, edit and delete blog articles (EN/AR)",
    bg: "#f5f3ff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="14" height="18" rx="2.5" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
        <path d="M7 8h6M7 11h6M7 14h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15 17l4-4 2 2-4 4H15v-2z" fill="#7c3aed" stroke="#7c3aed" strokeWidth="0.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/surveys",
    title: "Surveys",
    description: "Create and manage customer feedback surveys",
    bg: "#ecfeff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="3" fill="#cffafe" stroke="#0891b2" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1.2" fill="#0891b2"/>
        <circle cx="8" cy="12" r="1.2" fill="#0891b2" opacity="0.7"/>
        <circle cx="8" cy="16" r="1.2" fill="#0891b2" opacity="0.5"/>
        <path d="M11 8h5M11 12h5M11 16h3" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/survey-results",
    title: "Survey Results",
    description: "View charts, responses and export CSV",
    bg: "#f0fdfa",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5"/>
        <rect x="5" y="15" width="3" height="4" rx="1" fill="#0d9488"/>
        <rect x="10" y="11" width="3" height="8" rx="1" fill="#0d9488" opacity="0.7"/>
        <rect x="15" y="8" width="3" height="11" rx="1" fill="#0d9488" opacity="0.5"/>
        <path d="M5.5 13l4.5-4 4.5 3 4.5-5" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    title: "Categories",
    description: "Manage product categories and taxonomies",
    bg: "#fffbeb",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5"/>
        <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" opacity="0.7"/>
        <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" opacity="0.7"/>
        <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" opacity="0.4"/>
      </svg>
    ),
  },
  {
    href: "/admin/stores",
    title: "Stores",
    description: "Update store information, hours and photos",
    bg: "#f0fdf4",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5l9-7 9 7V20a2 2 0 01-2 2H5a2 2 0 01-2-2v-9.5z" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
        <rect x="9" y="13" width="6" height="9" rx="1.5" fill="#16a34a" opacity="0.5"/>
        <circle cx="12" cy="9" r="2" fill="#16a34a" opacity="0.7"/>
      </svg>
    ),
  },
  {
    href: "/admin/translations",
    title: "Translations",
    description: "Edit EN/AR text content across all pages",
    bg: "#f0fdf4",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M3 12h18M12 3a14 14 0 000 18M12 3a14 14 0 010 18" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M7 9h4l-2 6M13 9h4" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/meta",
    title: "Meta Tags / SEO",
    description: "Edit page titles and descriptions",
    bg: "#fdf4ff",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#fae8ff" stroke="#a21caf" strokeWidth="1.5"/>
        <path d="M6 9h12M6 13h8M6 17h5" stroke="#a21caf" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18.5" cy="16.5" r="3" fill="#a21caf"/>
        <path d="M17.5 16.5h2M18.5 15.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/google-business",
    title: "Google Business",
    description: "Monitor reviews, ratings & branch performance",
    bg: "#fff1f2",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1.5"/>
        <circle cx="12" cy="9" r="2.5" fill="#e11d48"/>
      </svg>
    ),
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
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Welcome back! Manage your website content below.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {navCards.map((card) => (
          <Link key={card.href} href={card.href} className="admin-dashboard-card">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              {card.icon}
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{card.title}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}