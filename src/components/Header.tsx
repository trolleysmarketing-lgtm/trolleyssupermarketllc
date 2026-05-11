"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const switchLocale = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
    setMobileOpen(false);
  };

  const navLinks = [
    { href: `/${locale}`,          label: t("home")    },
    { href: `/${locale}/about`,    label: t("about")   },
    { href: `/${locale}/stores`,   label: t("stores")  },
    { href: `/${locale}/offers`,   label: t("offers")  },
    { href: `/${locale}/blog`,     label: t("blog")    },
    { href: `/${locale}/contact`,  label: t("contact") },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        :root {
          --primary: #1C75BC;
          --primary-light: #2c4a63;
          --gold: #c8956c;
          --gold-light: #d4a87c;
          --gold-pale: #faf6f2;
          --text: #1a1a1a;
          --text-soft: #5c5c5c;
          --text-muted: #8c8c8c;
          --bg: #ffffff;
          --bg-cream: #fdfbf9;
          --border: #e8e3dc;
          --border-light: #f0ebe4;
          --shadow-elegant: 0 1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 24px rgba(0,0,0,0.06);
          --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ── TOP BAR ── */
        .hdr-topbar {
          background: var(--primary);
          padding: 0;
          font-size: 11px;
          letter-spacing: 0.03em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hdr-topbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 6px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 32px;
        }
        .hdr-topbar-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .hdr-top-link {
          color: rgb(255, 255, 255);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.25s;
          font-weight: 450;
          font-size: 11px;
        }
        .hdr-top-link:hover { color: var(--gold-light); }
        .hdr-top-sep {
          width: 1px;
          height: 10px;
          background: rgba(255,255,255,0.2);
        }
        .hdr-top-right {
          color: rgb(255, 255, 255);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ── MAIN HEADER ── */
        .hdr {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg);
          transition: all 0.35s var(--ease-smooth);
        }
        .hdr.hdr-scrolled {
          box-shadow: var(--shadow-elegant);
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(16px);
        }
        .hdr-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 36px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* Logo */
        .hdr-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .hdr-logo img {
          height: 42px;
          width: auto;
          display: block;
          transition: all 0.35s var(--ease-smooth);
        }
        .hdr-scrolled .hdr-logo img { height: 38px; }

        /* Desktop Nav */
        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }
        .hdr-nav-link {
          padding: 8px 18px;
          font-size: 13.5px;
          font-weight: 480;
          color: var(--text-soft);
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.25s var(--ease-smooth);
          letter-spacing: 0.01em;
          position: relative;
        }
        .hdr-nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 20px;
          height: 1.5px;
          background: #1C75BC;
          border-radius: 1px;
          transition: transform 0.3s var(--ease-smooth);
        }
        .hdr-nav-link:hover {
          color: var(--primary);
          background: var(--bg-cream);
        }
        .hdr-nav-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        .hdr-nav-link.hdr-active {
          color: var(--primary);
          font-weight: 600;
          background: var(--gold-pale);
        }
        .hdr-nav-link.hdr-active::after {
          transform: translateX(-50%) scaleX(1);
          background: #1C75BC;
          width: 24px;
        }

        /* Desktop Actions */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .hdr-btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-soft);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s var(--ease-smooth);
          text-decoration: none;
        }
        .hdr-btn-icon:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .hdr-btn-lang {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-soft);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s var(--ease-smooth);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .hdr-btn-lang:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
        }
        .hdr-btn-offers {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 22px;
          border-radius: 20px;
          background: var(--primary);
          color: white;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s var(--ease-smooth);
          letter-spacing: 0.02em;
          border: 1px solid transparent;
        }
        .hdr-btn-offers:hover {
          background: var(--primary-light);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,46,63,0.15);
          border-color: rgba(255,255,255,0.1);
        }
        .hdr-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: white;
          flex-shrink: 0;
          animation: softPulse 2.5s ease-in-out infinite;
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }

        /* ── MOBILE ── */
        .hdr-mobile-group {
          display: none;
          align-items: center;
          gap: 6px;
        }
        .hdr-mob-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: var(--bg);
          color: var(--text-soft);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s var(--ease-smooth);
          text-decoration: none;
        }
        .hdr-mob-icon:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
        }
        .hdr-mob-icon.active-icon {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .hdr-mob-icon.active-icon:hover {
          background: var(--primary-light);
          border-color: var(--primary-light);
          color: white;
        }
        .hdr-burger {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--bg);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s var(--ease-smooth);
          z-index: 300;
          margin-left: 2px;
        }
        .hdr-burger:hover {
          border-color: var(--primary);
          background: var(--bg-cream);
        }
        .hdr-burger span {
          width: 16px;
          height: 1.5px;
          background: var(--primary);
          border-radius: 2px;
          transition: all 0.35s var(--ease-smooth);
          display: block;
          transform-origin: center;
        }
        .hdr-burger.open span:nth-child(1) { 
          transform: translateY(5.5px) rotate(45deg); 
          width: 16px;
        }
        .hdr-burger.open span:nth-child(2) { 
          opacity: 0; 
          transform: scaleX(0); 
        }
        .hdr-burger.open span:nth-child(3) { 
          transform: translateY(-5.5px) rotate(-45deg); 
          width: 16px;
        }

        /* ── OVERLAY ── */
        .hdr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 46, 63, 0.5);
          backdrop-filter: blur(2px);
          z-index: 199;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s var(--ease-smooth);
        }
        .hdr-overlay.open { opacity: 1; visibility: visible; }

        /* ── DRAWER ── */
        .hdr-drawer {
          position: fixed;
          top: 0;
          bottom: 0;
          width: 320px;
          background: var(--bg);
          z-index: 200;
          transition: transform 0.45s var(--ease-smooth);
          box-shadow: 8px 0 40px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }
        .hdr-drawer.ltr { left: 0; transform: translateX(-100%); }
        .hdr-drawer.rtl { right: 0; transform: translateX(100%); }
        .hdr-drawer.open { transform: translateX(0); }

        .hdr-drawer-head {
          padding: 28px 28px 24px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hdr-drawer-head img { height: 36px; }
        .hdr-drawer-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.25s;
        }
        .hdr-drawer-close:hover { 
          border-color: var(--primary); 
          color: var(--primary);
          background: var(--bg-cream);
        }

        .hdr-drawer-nav {
          padding: 12px 16px;
          flex: 1;
          overflow-y: auto;
        }
        .hdr-drawer-link {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 480;
          color: var(--text-soft);
          text-decoration: none;
          transition: all 0.22s;
          border-radius: 10px;
          margin-bottom: 2px;
          letter-spacing: 0.01em;
        }
        .hdr-drawer-link:hover { 
          background: var(--bg-cream); 
          color: var(--primary);
          padding-left: 24px;
        }
        .hdr-drawer-link.hdr-active { 
          color: var(--primary); 
          font-weight: 600; 
          background: var(--gold-pale);
          padding-left: 24px;
        }
        .hdr-drawer-link .hdr-dl-indicator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #1C75BC;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.3s;
          margin-left: auto;
        }
        .hdr-drawer-link.hdr-active .hdr-dl-indicator { opacity: 1; }

        .hdr-drawer-footer {
          padding: 20px 28px 32px;
          border-top: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hdr-drawer-offers {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.25s;
          letter-spacing: 0.02em;
        }
        .hdr-drawer-offers:hover { 
          background: var(--primary-light);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,46,63,0.12);
        }
        .hdr-drawer-actions {
          display: flex;
          gap: 8px;
        }
        .hdr-drawer-store-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-soft);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s;
        }
        .hdr-drawer-store-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
        }
        .hdr-drawer-lang {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-soft);
          cursor: pointer;
          transition: all 0.25s;
          text-align: center;
        }
        .hdr-drawer-lang:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
        }

        /* ── RESPONSIVE ── */
        @media(max-width:960px) {
          .hdr-nav, .hdr-actions { display: none; }
          .hdr-mobile-group { display: flex; }
          .hdr-inner { padding: 0 16px; height: 66px; }
          .hdr-topbar-inner { padding: 0 16px; }
          .hdr-logo img { height: 36px; }
          .hdr-scrolled .hdr-logo img { height: 32px; }
        }
        @media(max-width:480px) {
          .hdr-top-left-phone { display: none; }
          .hdr-topbar-inner { justify-content: center; }
          .hdr-inner { padding: 0 12px; gap: 12px; }
          .hdr-mobile-group { gap: 4px; }
          .hdr-mob-icon { width: 34px; height: 34px; }
          .hdr-burger { width: 36px; height: 36px; }
          .hdr-drawer { width: 100%; }
          .hdr-logo img { height: 32px; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="hdr-topbar">
        <div className="hdr-topbar-inner">
          <div className="hdr-topbar-left">
            <a href="tel:+97142322966" className="hdr-top-link hdr-top-left-phone">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              +971 4 232 2966
            </a>
            <span className="hdr-top-sep hdr-top-left-phone" />
            <a href="https://wa.me/971564087776" target="_blank" rel="noopener noreferrer" className="hdr-top-link">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {isAr ? "واتساب" : "WhatsApp"}
            </a>
          </div>
          <div className="hdr-top-right">
            {isAr ? "دبي · الشارقة · عجمان" : "Dubai · Sharjah · Ajman"}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className={`hdr${scrolled ? " hdr-scrolled" : ""}`}>
        <div className="hdr-inner">

          {/* Logo */}
          <Link href={`/${locale}`} className="hdr-logo">
            <img src="/trolleys-supermarket-llc-logo.png" alt="Trolleys Supermarket UAE" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hdr-nav">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`hdr-nav-link${isActive(link.href) ? " hdr-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hdr-actions">
            {/* Store Locator Icon */}
            <Link href={`/${locale}/stores`} className="hdr-btn-icon" title={t("stores")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </Link>
            
            {/* Language Switcher */}
            <button className="hdr-btn-lang" onClick={switchLocale}>
              {locale === "en" ? "عربي" : "English"}
            </button>
            
            {/* Offers CTA */}
            <Link href={`/${locale}/offers`} className="hdr-btn-offers">
              <span className="hdr-dot" />
              {isAr ? "العروض الأسبوعية" : "Weekly Offers"}
            </Link>
          </div>

          {/* ── MOBILE GROUP ── */}
          <div className="hdr-mobile-group">
            {/* Store Locator */}
            <Link href={`/${locale}/stores`} className="hdr-mob-icon" title={t("stores")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </Link>

            {/* Offers */}
            <Link href={`/${locale}/offers`} className="hdr-mob-icon active-icon" title={isAr ? "العروض" : "Offers"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </Link>

            {/* Language */}
            <button className="hdr-mob-icon" onClick={switchLocale} title={locale === "en" ? "العربية" : "English"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </button>

            {/* Hamburger */}
            <button
              className={`hdr-burger${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>

        </div>
      </header>

      {/* ── OVERLAY ── */}
      <div 
        className={`hdr-overlay${mobileOpen ? " open" : ""}`} 
        onClick={() => setMobileOpen(false)} 
      />

      {/* ── DRAWER ── */}
      <div className={`hdr-drawer ${isAr ? "rtl" : "ltr"}${mobileOpen ? " open" : ""}`}>
        <div className="hdr-drawer-head">
          <img src="/trolleys-supermarket-llc-logo.png" alt="Trolleys" />
          <button className="hdr-drawer-close" onClick={() => setMobileOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="hdr-drawer-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`hdr-drawer-link${isActive(link.href) ? " hdr-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
              <span className="hdr-dl-indicator" />
            </Link>
          ))}
        </nav>

        <div className="hdr-drawer-footer">
          <Link
            href={`/${locale}/offers`}
            className="hdr-drawer-offers"
            onClick={() => setMobileOpen(false)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {isAr ? "العروض الأسبوعية" : "Weekly Offers"}
          </Link>
          <div className="hdr-drawer-actions">
            <Link href={`/${locale}/stores`} className="hdr-drawer-store-btn" onClick={() => setMobileOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {isAr ? "فروعنا" : "Stores"}
            </Link>
            <button className="hdr-drawer-lang" onClick={switchLocale}>
              {locale === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}