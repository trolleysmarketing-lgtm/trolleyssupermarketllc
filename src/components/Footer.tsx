"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function Footer() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("footer");
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggle = (i: number) => setOpenSection(openSection === i ? null : i);

  const quickLinks = [
    { href: `/${locale}/about`, label: t("aboutUs") },
    { href: `/${locale}/offers`, label: t("offers") },
    { href: `/${locale}/contact`, label: t("contact") },
    { href: `/${locale}/faqs`, label: t("faqs") },
  ];

  const usefulLinks = [
    { href: `/${locale}/blog`, label: t("blog") },
    { href: `/${locale}/delivery`, label: t("deliveryInfo") },
    { href: `/${locale}/privacy`, label: t("privacyPolicy") },
    { href: `/${locale}/terms`, label: t("termsConditions") },
  ];

  const branches = [
    { label: t("branch1") },
    { label: t("branch2") },
    { label: t("branch3") },
    { label: t("branch4") },
  ];

  // SVG Logo Component
  const LogoSVG = () => (
    <svg 
      viewBox="0 0 260 466" 
      xmlns="http://www.w3.org/2000/svg" 
      className="footer-logo-svg"
      aria-label="Trolleys Supermarket"
    >
      <style>
        {`
          .footer-blue {
            fill: none;
            stroke: #1B75BB;
            stroke-width: 80;
            stroke-linecap: square;
            stroke-dasharray: 600;
            stroke-dashoffset: 600;
            animation: footerDrawBlue 3s ease-in-out infinite;
          }
          
          .footer-redU {
            fill: none;
            stroke: #DB2B2C;
            stroke-width: 80;
            stroke-linecap: round;
            stroke-dasharray: 700;
            stroke-dashoffset: 700;
            animation: footerDrawRed 3s ease-in-out infinite;
            animation-delay: 1s;
          }
          
          .footer-dot {
            fill: #DB2B2C;
            opacity: 0;
            animation: footerPop 3s ease-in-out infinite;
          }
          
          .footer-dot.left {
            animation-delay: 2s;
          }
          
          .footer-dot.right {
            animation-delay: 2.2s;
          }
          
          @keyframes footerDrawBlue {
            0%, 100% {
              stroke-dashoffset: 600;
              fill-opacity: 0;
            }
            40%, 60% {
              stroke-dashoffset: 0;
              fill-opacity: 0.1;
            }
          }
          
          @keyframes footerDrawRed {
            0%, 100% {
              stroke-dashoffset: 700;
              fill-opacity: 0;
            }
            40%, 60% {
              stroke-dashoffset: 0;
              fill-opacity: 0.1;
            }
          }
          
          @keyframes footerPop {
            0%, 100% {
              opacity: 0;
              transform: translateY(30px) scale(0.8);
            }
            30%, 40% {
              opacity: 1;
              transform: translateY(-10px) scale(1.05);
            }
            50%, 60% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {/* Blue shape */}
      <path className="footer-blue" d="M40 0 V200 M40 100 H220" />
      
      {/* Red U shape */}
      <path className="footer-redU" d="M40 240 A90 90 0 0 0 220 240" />
      
      {/* Bottom dots */}
      <circle className="footer-dot left" cx="90" cy="410" r="40"/>
      <circle className="footer-dot right" cx="170" cy="410" r="40"/>
    </svg>
  );

  return (
    <>
      <style jsx global>{`
        .footer {
          background: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          direction: ${isAr ? "rtl" : "ltr"};
          border-top: 1px solid #f0ebe4;
        }

        /* Top Bar */
        .footer-top {
          background: #1C75BC;
          padding: 5px 0;
          position: relative;
          overflow: hidden;
        }

        .footer-top::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: .02;
          background-image: radial-gradient(circle, #fff 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .footer-top-inner {
          max-width: 730px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .footer-top-text {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          font-weight: 400;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-top-text::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
          animation: footerPulse 2s ease-in-out infinite;
        }

        .footer-top-text strong {
          color: #ffffff;
          font-weight: 600;
        }

        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: white;
          padding: 9px 20px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 12px rgba(37,211,102,.2);
          white-space: nowrap;
        }

        .whatsapp-btn:hover {
          background: #1dbc58;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,211,102,.3);
        }

        /* Main Footer */
        .footer-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 32px 48px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr 1.5fr;
          gap: 40px;
        }

        /* Logo Section */
        .footer-logo-svg {
          width: 80px;
          height: auto;
          margin-bottom: 20px;
        }


        .footer-description {
          font-size: 12px;
          line-height: 1.6;
          color: #7a7a7a;
          margin-bottom: 24px;
          max-width: 260px;
        }

        /* Social Icons */
        .social-links {
          display: flex;
          gap: 10px;
        }

        .social-icon {
          width: 34px;
          height: 34px;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a0a0a0;
          text-decoration: none;
          transition: all 0.25s;
          border: 1px solid #e8e3dc;
        }

        .social-icon:hover {
          background: #1a2e3f;
          color: white;
          border-color: #1a2e3f;
          transform: translateY(-2px);
        }

        .social-icon svg {
          width: 14px;
          height: 14px;
        }

        /* Column Titles */
        .col-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }

        /* Links */
        .links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .links-list a {
          font-size: 12.5px;
          color: #7a7a7a;
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.5;
          font-weight: 400;
        }

        .links-list a:hover {
          color: #c8956c;
        }

        /* Contact Items */
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 12.5px;
          color: #7a7a7a;
          line-height: 1.5;
        }

        .contact-item a {
          color: #7a7a7a;
          text-decoration: none;
          transition: color 0.2s;
        }

        .contact-item a:hover {
          color: #c8956c;
        }

        /* Mobile Accordion */
        .mobile-accordion {
          display: none;
        }

        .accordion-item {
          border-bottom: 1px solid #f0ebe4;
        }

        .accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .accordion-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .accordion-chevron {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
          font-size: 10px;
          color: #a0a0a0;
        }

        .accordion-chevron.open {
          transform: rotate(180deg);
        }

        .accordion-body {
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .accordion-body.closed {
          max-height: 0;
        }

        .accordion-body.open {
          max-height: 400px;
          padding-bottom: 20px;
        }

        /* Bottom Bar */
        .footer-bottom {
          border-top: 1px solid #f0ebe4;
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .copyright {
          font-size: 11px;
          color: #a0a0a0;
        }

        .legal-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .legal-links a {
          font-size: 11px;
          color: #a0a0a0;
          text-decoration: none;
          transition: color 0.2s;
        }

        .legal-links a:hover {
          color: #c8956c;
        }

        .legal-links span {
          color: #d8d0c8;
          font-size: 10px;
        }

        /* RTL */
        [dir="rtl"] .footer-logo-section {
          text-align: right;
        }

        [dir="rtl"] .social-links {
          justify-content: flex-start;
        }

        /* Animations */
        @keyframes footerPulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr 1.2fr 1.3fr;
            gap: 30px;
          }
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .footer-top-inner {
            padding: 0 20px;
          }
          
          .footer-main {
            padding: 40px 20px 32px;
          }
          
          .footer-bottom {
            padding: 16px 20px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            display: none;
          }
          
          .mobile-accordion {
            display: block;
          }
          
          .footer-top-text {
            font-size: 11px;
          }
          
          .whatsapp-btn {
            padding: 7px 16px;
            font-size: 11px;
          }
          
          .footer-logo-svg {
            width: 60px;
          }
        }
      `}</style>

      <footer className="footer" dir={isAr ? "rtl" : "ltr"}>
        {/* Top Bar */}
        <div className="footer-top">
          <div className="footer-top-inner">
            <p className="footer-top-text">
              <strong>{t("whatsappChannel")}</strong>
              {" • "}
              {t("whatsappDesc")}
            </p>
            <a
              href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              {t("join")}
            </a>
          </div>
        </div>

        {/* Main Footer */}
        <div className="footer-main">
          {/* Desktop Grid */}
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-logo-section">
              <LogoSVG />
            
              <div className="social-links">
                <a href="https://www.facebook.com/TrolleysUAE" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                </a>
                <a href="https://www.instagram.com/trolleysuae/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@trolleysuae" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                </a>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="col-title">{t("quickLinks")}</h3>
              <ul className="links-list">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* USEFUL LINKS */}
            <div>
              <h3 className="col-title">{t("usefulLinks")}</h3>
              <ul className="links-list">
                {usefulLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* OUR BRANCHES */}
            <div>
              <h3 className="col-title">{t("ourBranches")}</h3>
              <ul className="links-list">
                {branches.map((branch) => (
                  <li key={branch.label}>
                    <Link href={`/${locale}/stores`}>{branch.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* GET IN TOUCH */}
            <div>
              <h3 className="col-title">{t("getInTouch")}</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <span>{t("address")}</span>
                </div>
                <div className="contact-item">
                  <a href={`tel:${t("phone")}`}>{t("phone")}</a>
                </div>
                <div className="contact-item">
                  <a href={`mailto:${t("email")}`}>{t("email")}</a>
                </div>
                <div className="contact-item">
                  <span>{t("hours")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Accordion */}
          <div className="mobile-accordion">
            <div style={{ marginBottom: 28 }}>
              <LogoSVG />
             
              <div className="social-links">
                <a href="https://www.facebook.com/TrolleysUAE" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                </a>
                <a href="https://www.instagram.com/trolleysuae/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@trolleysuae" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                </a>
              </div>
            </div>

            {[quickLinks, usefulLinks, branches, []].map((links, i) => {
              const titles = [t("quickLinks"), t("usefulLinks"), t("ourBranches"), t("getInTouch")];
              return (
                <div className="accordion-item" key={i}>
                  <div className="accordion-header" onClick={() => toggle(i)}>
                    <span className="accordion-title">{titles[i]}</span>
                    <span className={`accordion-chevron ${openSection === i ? "open" : ""}`}>▼</span>
                  </div>
                  <div className={`accordion-body ${openSection === i ? "open" : "closed"}`}>
                    {i === 3 ? (
                      <div className="contact-list">
                        <div className="contact-item"><a href={`tel:${t("phone")}`}>{t("phone")}</a></div>
                        <div className="contact-item"><a href={`mailto:${t("email")}`}>{t("email")}</a></div>
                        <div className="contact-item"><span>{t("hours")}</span></div>
                        <div className="contact-item"><span>{t("fridayHours")}</span></div>
                      </div>
                    ) : (
                      <ul className="links-list">
                        {links.map((link: any) => (
                          <li key={link.href || link.label}>
                            <Link href={link.href || `/${locale}/stores`} onClick={() => setOpenSection(null)}>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Trolley's Supermarket LLC. {t("copyright")}
          </p>
          <div className="legal-links">
            <Link href={`/${locale}/privacy`}>{t("privacyPolicyShort")}</Link>
            <span>|</span>
            <Link href={`/${locale}/terms`}>{t("termsOfUse")}</Link>
            <span>|</span>
            <Link href={`/${locale}/cookies`}>{t("cookiePolicy")}</Link>
          </div>
        </div>
      </footer>
    </>
  );
}