"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import styles from "./footer.module.css";

export default function Footer() {
  const locale = useLocale();
  const isAr   = locale === "ar";
  const t      = useTranslations("footer");
  const [openSection, setOpenSection] = useState<number | null>(null);
  const toggle = (i: number) => setOpenSection(openSection === i ? null : i);

  const quickLinks = [
    { href: `/${locale}/about`,    label: t("aboutUs")   },
    { href: `/${locale}/offers`,   label: t("offers")    },
    { href: `/${locale}/contact`,  label: t("contact")   },
    { href: `/${locale}/faqs`,     label: t("faqs")      },
  ];

  const usefulLinks = [
    { href: `/${locale}/blog`,     label: t("blog")          },
    { href: `/${locale}/delivery`, label: t("deliveryInfo")  },
    { href: `/${locale}/privacy`,  label: t("privacyPolicy") },
    { href: `/${locale}/terms`,    label: t("termsConditions") },
  ];

  const branches = [
    { label: t("branch1"), href: `/${locale}/stores/mirdif-dubai`       },
    { label: t("branch2"), href: `/${locale}/stores/al-taawun-sharjah`  },
    { label: t("branch3"), href: `/${locale}/stores/al-khan-sharjah`    },
    { label: t("branch4"), href: `/${locale}/stores/al-nuaimiya-ajman`  },
    { label: t("branch5"), href: `/${locale}/stores/oasis-street-ajman` },
  ];

  /* ── Animated logo ── */
  const LogoSVG = () => (
    <svg viewBox="0 0 260 466" xmlns="http://www.w3.org/2000/svg"
      className={styles.logoSvg} aria-label="Trolleys Supermarket">
      <style>{`
        .fb { fill:none; stroke:#1B75BB; stroke-width:80; stroke-linecap:square;
              stroke-dasharray:600; stroke-dashoffset:600;
              animation:footerDrawBlue 3s ease-in-out infinite; }
        .fr { fill:none; stroke:#DB2B2C; stroke-width:80; stroke-linecap:round;
              stroke-dasharray:700; stroke-dashoffset:700;
              animation:footerDrawRed 3s ease-in-out infinite; animation-delay:1s; }
        .fd { fill:#DB2B2C; opacity:0; animation:footerPop 3s ease-in-out infinite; }
        .fd.l { animation-delay:2s; }
        .fd.r { animation-delay:2.2s; }
        @keyframes footerDrawBlue {
          0%,100%{stroke-dashoffset:600;fill-opacity:0}
          40%,60%{stroke-dashoffset:0;fill-opacity:.1} }
        @keyframes footerDrawRed {
          0%,100%{stroke-dashoffset:700;fill-opacity:0}
          40%,60%{stroke-dashoffset:0;fill-opacity:.1} }
        @keyframes footerPop {
          0%,100%{opacity:0;transform:translateY(30px) scale(.8)}
          30%,40%{opacity:1;transform:translateY(-10px) scale(1.05)}
          50%,60%{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
      <path className="fb" d="M40 0 V200 M40 100 H220" />
      <path className="fr" d="M40 240 A90 90 0 0 0 220 240" />
      <circle className="fd l" cx="90" cy="410" r="40"/>
      <circle className="fd r" cx="170" cy="410" r="40"/>
    </svg>
  );

  const SocialLinks = () => (
    <div className={styles.socialLinks}>
      <a href="https://www.facebook.com/TrolleysUAE" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
      </a>
      <a href="https://www.instagram.com/trolleysuae/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@trolleysuae" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
      </a>
    </div>
  );

  const accordionSections = [
    { title: t("quickLinks"),   links: quickLinks  },
    { title: t("usefulLinks"),  links: usefulLinks },
    { title: t("ourBranches"),  links: branches    },
    { title: t("getInTouch"),   links: []          },
  ];

  return (
    <footer className={styles.footer} dir={isAr ? "rtl" : "ltr"}>

      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <p className={styles.topBarText}>
            <strong>{t("whatsappChannel")}</strong>{" • "}{t("whatsappDesc")}
          </p>
          <a href="https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"
            target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            {t("join")}
          </a>
        </div>
      </div>

      {/* ── Main ── */}
      <div className={styles.main}>

        {/* Desktop Grid */}
        <div className={styles.grid}>
          {/* Brand */}
          <div>
            <LogoSVG />
            <SocialLinks />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={styles.colTitle}>{t("quickLinks")}</h3>
            <ul className={styles.linksList}>
              {quickLinks.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className={styles.colTitle}>{t("usefulLinks")}</h3>
            <ul className={styles.linksList}>
              {usefulLinks.map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h3 className={styles.colTitle}>{t("ourBranches")}</h3>
            <ul className={styles.linksList}>
              {branches.map(b => <li key={b.href}><Link href={b.href}>{b.label}</Link></li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={styles.colTitle}>{t("getInTouch")}</h3>
            <div className={styles.contactList}>
              <div className={styles.contactItem}><span>{t("address")}</span></div>
              <div className={styles.contactItem}><a href={`tel:${t("phone")}`}>{t("phone")}</a></div>
              <div className={styles.contactItem}><a href={`mailto:${t("email")}`}>{t("email")}</a></div>
              <div className={styles.contactItem}><span>{t("hours")}</span></div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className={styles.mobileAccordion}>
          <div style={{ marginBottom: 28 }}>
            <LogoSVG />
            <SocialLinks />
          </div>

          {accordionSections.map((sec, i) => (
            <div key={i} className={styles.accordionItem}>
              <div className={styles.accordionHeader} onClick={() => toggle(i)}>
                <span className={styles.accordionTitle}>{sec.title}</span>
                <span className={`${styles.accordionChevron} ${openSection === i ? styles.accordionChevronOpen : ""}`}>▼</span>
              </div>
              <div className={`${styles.accordionBody} ${openSection === i ? styles.accordionOpen : styles.accordionClosed}`}>
                {i === 3 ? (
                  <div className={styles.contactList}>
                    <div className={styles.contactItem}><a href={`tel:${t("phone")}`}>{t("phone")}</a></div>
                    <div className={styles.contactItem}><a href={`mailto:${t("email")}`}>{t("email")}</a></div>
                    <div className={styles.contactItem}><span>{t("hours")}</span></div>
                    <div className={styles.contactItem}><span>{t("fridayHours")}</span></div>
                  </div>
                ) : (
                  <ul className={styles.linksList}>
                    {sec.links.map((l: any) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={() => setOpenSection(null)}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Trolley's Supermarket LLC. {t("copyright")}
        </p>
        <div className={styles.legalLinks}>
          <Link href={`/${locale}/privacy`}>{t("privacyPolicyShort")}</Link>
          <span>|</span>
          <Link href={`/${locale}/terms`}>{t("termsOfUse")}</Link>
          <span>|</span>
          <Link href={`/${locale}/cookies`}>{t("cookiePolicy")}</Link>
        </div>
      </div>
    </footer>
  );
}