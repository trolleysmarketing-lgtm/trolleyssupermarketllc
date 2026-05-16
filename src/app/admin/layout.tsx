"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV = [
  {
    group: null,
    items: [
      { href: "/admin", label: "Dashboard", exact: true, icon: <IconDashboard /> },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/hero",         label: "Hero Slider",     icon: <IconSlider />    },
      { href: "/admin/ticker",       label: "Ticker",          icon: <IconTicker />    },
      { href: "/admin/announcement", label: "Announcement",    icon: <IconMega />      },
      { href: "/admin/offers",       label: "Offers & Catalog",icon: <IconOffer />     },
      { href: "/admin/blog",         label: "Blog Posts",      icon: <IconBlog />      },
      { href: "/admin/categories",   label: "Categories",      icon: <IconGrid />      },
    ],
  },
  {
    group: "Customers",
    items: [
      { href: "/admin/surveys",        label: "Surveys",        icon: <IconSurvey />   },
      { href: "/admin/survey-results", label: "Survey Results", icon: <IconChart />    },
    ],
  },
  {
    group: "Locations",
    items: [
      { href: "/admin/stores",          label: "Stores",          icon: <IconStore />   },
      { href: "/admin/google-business", label: "Google Business", icon: <IconGoogle />  },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/translations", label: "Translations",  icon: <IconLang />  },
      { href: "/admin/meta",         label: "SEO / Meta",    icon: <IconSeo />   },
    ],
  },
];

// ─── Icon components ──────────────────────────────────────────────────────────
function Ico({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>{d2 && <path d={d2}/>}
    </svg>
  );
}
function IconDashboard() { return <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>; }
function IconSlider()    { return <Ico d="M2 6h20v12H2z" d2="M1 12h2M21 12h2"/>; }
function IconTicker()    { return <Ico d="M2 9h20v6H2z" d2="M20 6l2 3-2 3M4 6L2 9l2 3"/>; }
function IconMega()      { return <Ico d="M22 17H2a3 3 0 000 6h20" d2="M6 5l1.5 4M18 5l-1.5 4"/>; }
function IconOffer()     { return <Ico d="M20 12V22H4V12" d2="M22 7H2v5h20V7zM12 22V7"/>; }
function IconBlog()      { return <Ico d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" d2="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>; }
function IconGrid()      { return <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>; }
function IconSurvey()    { return <Ico d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" d2="M14 2v6h6M16 13H8M16 17H8"/>; }
function IconChart()     { return <Ico d="M18 20V10M12 20V4M6 20v-6"/>; }
function IconStore()     { return <Ico d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10"/>; }
function IconGoogle()    { return <Ico d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" d2="M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0"/>; }
function IconLang()      { return <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2z" d2="M2 12h20M12 2a15.3 15.3 0 010 20"/>; }
function IconSeo()       { return <Ico d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" d2="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>; }
function IconSignOut()   { return <Ico d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" d2="M16 17l5-5-5-5M21 12H9"/>; }
function IconExternal()  { return <Ico d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" d2="M15 3h6v6M10 14L21 3"/>; }

export function getAdminHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token") ?? "";
  return token ? { "x-admin-token": token } : {};
}

// ─── Main layout ──────────────────────────────────────────────────────────────
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #ffffff20", borderTopColor: "#1C75BC", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 14px" }}/>
        <p style={{ fontSize: 13, color: "#ffffff50", margin: 0 }}>Authenticating…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (pathname === "/admin/login") return <SessionProvider>{children}</SessionProvider>;
  if (!authorized) return null;

  return (
    <SessionProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f5f7" }}>

        {/* Mobile overlay */}
        {open && mobile && (
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 40, backdropFilter: "blur(2px)" }}/>
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          position:   "fixed",
          top: 0, bottom: 0,
          left:       mobile ? (open ? 0 : -260) : 0,
          width:      260,
          background: "#0f1117",
          zIndex:     50,
          display:    "flex",
          flexDirection: "column",
          transition: "left .28s cubic-bezier(.4,0,.2,1)",
          borderRight: "1px solid #ffffff08",
        }}>

          {/* Logo */}
          <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #ffffff0a", flexShrink: 0 }}>
            <img src="/trolleys-supermarket-llc-logo.png" alt="Trolleys" style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: .92 }}/>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px", scrollbarWidth: "none" }}>
            <style>{`nav::-webkit-scrollbar{display:none}`}</style>

            {NAV.map((section, si) => (
              <div key={si} style={{ marginBottom: 4 }}>
                {section.group && (
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#ffffff30", letterSpacing: ".12em", textTransform: "uppercase", padding: "14px 10px 6px", margin: 0 }}>
                    {section.group}
                  </p>
                )}
                {section.items.map(item => {
                  const active = isActive(item.href, (item as any).exact);
                  return (
                    <Link key={item.href} href={item.href}
                      onClick={() => mobile && setOpen(false)}
                      style={{
                        display:        "flex",
                        alignItems:     "center",
                        gap:            10,
                        padding:        "8px 10px",
                        borderRadius:   8,
                        marginBottom:   1,
                        textDecoration: "none",
                        fontSize:       13,
                        fontWeight:     active ? 600 : 400,
                        color:          active ? "#ffffff" : "#ffffff55",
                        background:     active ? "#ffffff0f" : "transparent",
                        borderLeft:     active ? "2px solid #1C75BC" : "2px solid transparent",
                        paddingLeft:    active ? 8 : 8,
                        transition:     "all .12s",
                        letterSpacing:  "-.01em",
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.color="#ffffff99"; e.currentTarget.style.background="#ffffff06"; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.color="#ffffff55"; e.currentTarget.style.background="transparent"; } }}
                    >
                      <span style={{ flexShrink: 0, opacity: active ? 1 : .6 }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "10px", borderTop: "1px solid #ffffff0a", flexShrink: 0 }}>
            <Link href="/en" target="_blank"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, textDecoration: "none", fontSize: 12, color: "#ffffff40", marginBottom: 2, transition: "color .12s" }}
              onMouseEnter={e => e.currentTarget.style.color="#ffffff80"}
              onMouseLeave={e => e.currentTarget.style.color="#ffffff40"}>
              <IconExternal/>
              View Website
            </Link>
            <button
              onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin/login"); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#ffffff40", background: "none", border: "none", cursor: "pointer", width: "100%", transition: "color .12s" }}
              onMouseEnter={e => e.currentTarget.style.color="#ff6b6b"}
              onMouseLeave={e => e.currentTarget.style.color="#ffffff40"}>
              <IconSignOut/>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Content area ── */}
        <div style={{ flex: 1, marginLeft: mobile ? 0 : 260, display: "flex", flexDirection: "column", minWidth: 0, transition: "margin-left .28s cubic-bezier(.4,0,.2,1)" }}>

          {/* Top bar */}
          <header style={{ height: 52, background: "white", borderBottom: "1px solid #eaecf0", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
            {mobile && (
              <button onClick={() => setOpen(!open)}
                style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, border: "1px solid #eaecf0", background: "white", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
                  {open
                    ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                  }
                </svg>
              </button>
            )}

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
              <span style={{ color: "#111827", fontWeight: 600 }}>
                {NAV.flatMap(s => s.items).find(i => isActive(i.href, (i as any).exact))?.label ?? "Admin"}
              </span>
            </div>

            {/* Right side — date */}
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-AE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: "28px 28px", maxWidth: 1240, width: "100%", margin: "0 auto", alignSelf: "stretch" }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}