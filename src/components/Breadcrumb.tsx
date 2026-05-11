// components/Breadcrumb.tsx
import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ crumbs, locale }: { crumbs: Crumb[]; locale: string }) {
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trolleys.ae";
  
  // Ana sayfa dahil tüm kırıntıları oluştur
  const allCrumbs = [
    { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
    ...crumbs
  ];

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allCrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": `${baseUrl}${crumb.href || ""}`
    }))
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Görsel Breadcrumb */}
      <nav aria-label={isAr ? "مسار التنقل" : "Breadcrumb"}>
        <div style={{
          background: "white",
          borderBottom: "1px solid #e2edf5",
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}>
          <div style={{ 
            maxWidth: 1280, 
            margin: "0 auto", 
            padding: "12px 32px", 
            display: "flex", 
            alignItems: "center", 
            gap: 6, 
            flexWrap: "wrap" 
          }}>
            {allCrumbs.map((crumb, index) => (
              <span key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Sadece ilk elemandan sonra ok işareti */}
                {index > 0 && (
                  <svg 
                    width="10" 
                    height="10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    style={{ transform: isAr ? "rotate(180deg)" : "none" }}
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                )}
                
                {/* İlk eleman (Ana sayfa) için özel stil */}
                {index === 0 ? (
                  <Link 
                    href={crumb.href || "/"} 
                    style={{ 
                      fontSize: 12, 
                      color: "#94a3b8", 
                      textDecoration: "none", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 4, 
                      transition: "color 0.15s" 
                    }}
                    aria-label={isAr ? "الرئيسية" : "Home"}
                  >
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {crumb.label}
                  </Link>
                ) : index === allCrumbs.length - 1 ? (
                  // Son eleman (mevcut sayfa) - tıklanamaz
                  <span style={{ 
                    fontSize: 12, 
                    color: "#0e76bc", 
                    fontWeight: 600,
                    cursor: "default"
                  }}>
                    {crumb.label}
                  </span>
                ) : (
                  // Ara elemanlar - link
                  <Link 
                    href={crumb.href || "#"} 
                    style={{ 
                      fontSize: 12, 
                      color: "#94a3b8", 
                      textDecoration: "none",
                      transition: "color 0.15s"
                    }}
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}