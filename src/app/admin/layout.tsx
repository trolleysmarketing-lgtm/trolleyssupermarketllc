"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    group: null,
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/hero",         label: "Hero Slider"      },
      { href: "/admin/ticker",       label: "Ticker"           },
      { href: "/admin/announcement", label: "Announcement"     },
      { href: "/admin/offers",       label: "Offers & Catalog" },
      { href: "/admin/blog",         label: "Blog Posts"       },
      { href: "/admin/categories",   label: "Categories"       },
    ],
  },
  {
    group: "Customers",
    items: [
      { href: "/admin/surveys",         label: "Surveys"        },
      { href: "/admin/survey-results",  label: "Survey Results" },
      { href: "/admin/google-business", label: "Google Business"},
    ],
  },
  {
    group: "Locations",
    items: [
      { href: "/admin/stores", label: "Stores" },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/translations", label: "Translations" },
      { href: "/admin/meta",         label: "SEO / Meta"   },
    ],
  },
];

export function getAdminHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token") ?? "";
  return token ? { "x-admin-token": token } : {};
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open,       setOpen]       = useState(false);
  const [mobile,     setMobile]     = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking,   setChecking]   = useState(true);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (pathname === "/admin/login") { setChecking(false); return; }
    if (authorized) { setChecking(false); return; }
    (async () => {
      try {
        const token = localStorage.getItem("admin_token") ?? "";
        const res   = await fetch("/api/admin/check-auth", { headers: token ? { "x-admin-token": token } : {} });
        if (res.ok) setAuthorized(true);
        else { localStorage.removeItem("admin_token"); router.push("/admin/login"); }
      } catch { router.push("/admin/login"); }
      setChecking(false);
    })();
  }, [pathname, router, authorized]);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { if (mobile) setOpen(false); }, [pathname, mobile]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  if (checking && pathname !== "/admin/login") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 28, height: 28, border: "2.5px solid #e5e7eb", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 12px" }}/>
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading…</p>
      </div>
    </div>
  );

  if (pathname === "/admin/login") return <SessionProvider>{children}</SessionProvider>;
  if (!authorized) return null;

  const currentLabel = NAV.flatMap(s => s.items).find(i => isActive(i.href, (i as any).exact))?.label ?? "Admin";

  return (
    <SessionProvider>
      <style>{`
        .sl-item { display:flex; align-items:center; gap:9px; padding:7px 12px; border-radius:7px; text-decoration:none; font-size:13px; font-weight:400; color:#4b5563; transition:background .12s,color .12s; margin-bottom:1px; }
        .sl-item:hover { background:#f3f4f6; color:#111827; }
        .sl-item.active { background:#eff6ff; color:#1C75BC; font-weight:600; }
        .sl-item .dot { width:6px; height:6px; border-radius:50%; background:#d1d5db; flex-shrink:0; transition:background .12s; }
        .sl-item.active .dot { background:#1C75BC; }
        .sl-item:hover .dot { background:#9ca3af; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>

        {/* Overlay */}
        {open && mobile && (
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 40 }}/>
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          position:      "fixed",
          top: 0, bottom: 0,
          left:          mobile ? (open ? 0 : -248) : 0,
          width:         248,
          background:    "#ffffff",
          borderRight:   "1px solid #e5e7eb",
          zIndex:        50,
          display:       "flex",
          flexDirection: "column",
          transition:    "left .25s ease",
        }}>

          {/* Logo */}
          <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
            <img src="/trolleys-supermarket-llc-logo.png" alt="Trolleys" style={{ height: 38, objectFit: "contain", display: "block" }}/>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px", scrollbarWidth: "none" }}>
            <style>{`nav::-webkit-scrollbar{display:none}`}</style>
            {NAV.map((section, si) => (
              <div key={si}>
                {section.group && (
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 12px 5px", margin: 0 }}>
                    {section.group}
                  </p>
                )}
                {section.items.map(item => {
                  const active = isActive(item.href, (item as any).exact);
                  return (
                    <Link key={item.href} href={item.href}
                      className={`sl-item${active ? " active" : ""}`}
                      onClick={() => mobile && setOpen(false)}>
                      <span className="dot"/>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "8px", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
            <Link href="/en" target="_blank"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 7, fontSize: 12, color: "#9ca3af", textDecoration: "none", marginBottom: 1, transition: "background .12s, color .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#f3f4f6"; e.currentTarget.style.color="#374151"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#9ca3af"; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>
              View Website
            </Link>
            <button
              onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin/login"); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 7, fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", width: "100%", transition: "background .12s, color .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#dc2626"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#9ca3af"; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, marginLeft: mobile ? 0 : 248, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Header */}
          <header style={{ height: 52, background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
            {mobile && (
              <button onClick={() => setOpen(!open)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{currentLabel}</span>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>
              {new Date().toLocaleDateString("en-AE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, padding: "28px 28px", maxWidth: 1200, width: "100%", alignSelf: "stretch" }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}