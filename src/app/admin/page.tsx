import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .adm { font-family: 'Outfit', system-ui, sans-serif; }
        .adm-card { transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s; cursor: pointer; text-decoration: none; display: block; }
        .adm-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.1) !important; }
      `}</style>

      <div className="adm" style={{ minHeight: "100vh", background: "#f8f9fb" }}>

        {/* Header */}
        <div style={{ background: "white", borderBottom: "1px solid #f1f5f9", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/trolleys-supermarket-llc-logo.png" alt="Trolleys" style={{ height: 38, objectFit: "contain" }} />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Admin Panel</p>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Trolleys Supermarket LLC</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/en" style={{ fontSize: 13, color: "#0e76bc", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
              View Website
            </Link>
            <Link href="/ar" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>عربي</Link>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px" }}>

          {/* Welcome */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Dashboard</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Welcome back! Manage your website content below.</p>
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>

            <Link className="adm-card" href="/admin/offers" style={{ background: "white", borderRadius: 20, padding: "26px 22px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e76bc" strokeWidth="1.8" strokeLinecap="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
              </div>
              <p style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Offers & Catalog</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Upload weekly PDF catalog, manage short links</p>
            </Link>

            <Link className="adm-card" href="/admin/blog" style={{ background: "white", borderRadius: 20, padding: "26px 22px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <p style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Blog Posts</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Add, edit and delete blog articles (EN/AR)</p>
            </Link>

            <Link className="adm-card" href="/admin/stores" style={{ background: "white", borderRadius: 20, padding: "26px 22px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <p style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Stores</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Update store information and locations</p>
            </Link>

            <Link className="adm-card" href="/admin/google-business" style={{ background: "white", borderRadius: 20, padding: "26px 22px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#de2b2e" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <p style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Google Business</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Monitor reviews, ratings & branch performance</p>
            </Link>

          </div>

          {/* Sign out */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
            <Link href="/api/admin/logout" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}