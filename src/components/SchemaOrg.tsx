export default function SchemaOrg({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const baseUrl = "https://trolleyssupermarketllc.com";

  // Organization schema
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "Trolleys Supermarket LLC",
    alternateName: isAr ? "ترولييز سوبرماركت" : "Trolleys Supermarket",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/trolleys-supermarket-llc-logo.png`,
      width: 512,
      height: 512,
    },
    image: `${baseUrl}/trolleys-supermarket-llc-logo.png`,
    description: isAr
      ? "ترولييز سوبرماركت — أفضل سوبرماركت في الإمارات. منتجات طازجة وعروض أسبوعية في دبي والشارقة وعجمان."
      : "Trolleys Supermarket LLC — Fresh groceries, weekly offers and fast delivery across Dubai, Sharjah and Ajman, UAE.",
    foundingDate: "2010",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 50 },
    areaServed: ["Dubai", "Sharjah", "Ajman", "UAE"],
    sameAs: [
      "https://www.facebook.com/TrolleysUAE",
      "https://www.instagram.com/trolleysuae/",
      "https://www.tiktok.com/@trolleysuae",
      "https://www.talabat.com/uae/trolleys-supermarket",
      "https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+971-4-232-2966",
        contactType: "customer service",
        areaServed: "AE",
        availableLanguage: ["English", "Arabic"],
      },
    ],
  };

  // WebSite schema with SearchAction
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Trolleys Supermarket",
    description: isAr
      ? "سوبرماركت ترولييز — عروض أسبوعية وتوصيل سريع في الإمارات"
      : "Trolleys Supermarket — Weekly offers and fast delivery in UAE",
    publisher: { "@id": `${baseUrl}/#organization` },
    inLanguage: ["en-AE", "ar-AE"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // 4 branches as separate LocalBusiness
  const branches = [
    {
      name: isAr ? "ترولييز سوبرماركت — مردف دبي" : "Trolleys Supermarket — Mirdif Dubai",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Golden Gate Shopping Centre",
        addressLocality: "Mirdif",
        addressRegion: "Dubai",
        addressCountry: "AE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 25.2217, longitude: 55.4146 },
      telephone: "+971-4-232-2966",
      openingHours: ["Mo-Su 07:00-02:00"],
      url: `${baseUrl}/${locale}/stores`,
      hasMap: "https://www.google.com/maps/place/?q=place_id:ChIJZUCb8PBhXz4R6WVzYGgrCbg",
    },
    {
      name: isAr ? "ترولييز سوبرماركت — التعاون الشارقة" : "Trolleys Supermarket — Al Taawun Sharjah",
      address: {
        "@type": "PostalAddress",
        streetAddress: "895C+XXP Al Khan",
        addressLocality: "Al Taawun",
        addressRegion: "Sharjah",
        addressCountry: "AE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 25.3211, longitude: 55.3905 },
      telephone: "+971-6-554-4505",
      openingHours: ["Mo-Su 07:00-03:00"],
      url: `${baseUrl}/${locale}/stores`,
      hasMap: "https://www.google.com/maps/place/?q=place_id:ChIJA2zBYWZbXz4RueLlNhbVf_4",
    },
    {
      name: isAr ? "ترولييز سوبرماركت — الخان الشارقة" : "Trolleys Supermarket — Al Khan Sharjah",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Al Khan Street",
        addressLocality: "Al Khan",
        addressRegion: "Sharjah",
        addressCountry: "AE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 25.3380, longitude: 55.3887 },
      telephone: "+971-6-575-7010",
      openingHours: ["Mo-Su 07:00-02:00"],
      url: `${baseUrl}/${locale}/stores`,
      hasMap: "https://www.google.com/maps/place/?q=place_id:ChIJ2ZtxfsVbXz4R2A-fxX703hs",
    },
    {
      name: isAr ? "ترولييز سوبرماركت — النعيمية عجمان" : "Trolleys Supermarket — Al Nuaimia Ajman",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Al Manama Market",
        addressLocality: "Al Nuaimia",
        addressRegion: "Ajman",
        addressCountry: "AE",
      },
      geo: { "@type": "GeoCoordinates", latitude: 25.4115, longitude: 55.4350 },
      telephone: "+971-6-749-9919",
      openingHours: ["Mo-Su 07:00-02:00"],
      url: `${baseUrl}/${locale}/stores`,
      hasMap: "https://www.google.com/maps/place/?q=place_id:ChIJ-6wNlfZZXz4REPMp59PqnpE",
    },
  ];

  const localBusinesses = branches.map(branch => ({
    "@context": "https://schema.org",
    "@type": ["GroceryStore", "LocalBusiness"],
    "@id": `${baseUrl}/#${branch.telephone.replace(/[^0-9]/g, "")}`,
    name: branch.name,
    image: `${baseUrl}/trolleys-supermarket-llc-logo.png`,
    url: branch.url,
    telephone: branch.telephone,
    address: branch.address,
    geo: branch.geo,
    hasMap: branch.hasMap,
    openingHours: branch.openingHours,
    priceRange: "$$",
    currenciesAccepted: "AED",
    paymentAccepted: "Cash, Credit Card, Apple Pay, Google Pay",
    servesCuisine: "Grocery",
    parentOrganization: { "@id": `${baseUrl}/#organization` },
    sameAs: [
      "https://www.facebook.com/TrolleysUAE",
      "https://www.instagram.com/trolleysuae/",
    ],
  }));

  // FAQPage schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: isAr ? "هل ترولييز يوصل للمنازل؟" : "Does Trolleys Supermarket deliver to homes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "نعم، نوصل في دبي والشارقة وعجمان. تواصل مع أقرب فرع عبر واتساب."
            : "Yes, Trolleys delivers across Dubai, Sharjah and Ajman. Contact your nearest branch via WhatsApp to place an order.",
        },
      },
      {
        "@type": "Question",
        name: isAr ? "كم عدد فروع ترولييز؟" : "How many Trolleys Supermarket branches are there?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "لدينا 4 فروع: مردف دبي، التعاون الشارقة، الخان الشارقة، النعيمية عجمان."
            : "Trolleys has 4 branches: Mirdif Dubai, Al Taawun Sharjah, Al Khan Sharjah, and Al Nuaimia Ajman.",
        },
      },
      {
        "@type": "Question",
        name: isAr ? "ما هي ساعات العمل؟" : "What are Trolleys Supermarket opening hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "تفتح جميع الفروع من الساعة 7 صباحاً. فرع التعاون يغلق الساعة 3 صباحاً، وباقي الفروع تغلق الساعة 2 صباحاً."
            : "All branches open at 7AM. Al Taawun closes at 3AM. Other branches close at 2AM daily.",
        },
      },
      {
        "@type": "Question",
        name: isAr ? "كيف أحصل على العروض الأسبوعية؟" : "How can I get Trolleys weekly offers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "انضم إلى قناة ترولييز على واتساب للحصول على الكتالوج الأسبوعي مجاناً."
            : "Join the Trolleys WhatsApp Channel to receive the free weekly catalog as soon as it's published.",
        },
      },
    ],
  };

  const schemas = [organization, website, ...localBusinesses, faqSchema];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}