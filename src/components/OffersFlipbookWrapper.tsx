"use client";

import dynamic from "next/dynamic";

const CatalogFlipbook = dynamic(
  () => import("@/components/CatalogFlipbook"),
  { ssr: false }
);

type Catalog = {
  id: string;
  title: string;
  filePath: string;
  validFrom: string;
  validTo: string;
};

export default function OffersFlipbookWrapper({
  catalog,
  locale,
}: {
  catalog: Catalog;
  locale: string;
}) {
  const isAr = locale === "ar";

  return (
    <div style={{ width: "100%" }}>
      
      {/* HEADER (MINIMAL) */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 6,
          }}
        >
          {catalog.title}
        </h2>

        <p style={{ fontSize: 12, color: "#94a3b8" }}>
          {isAr ? "صالح من" : "Valid"}: {catalog.validFrom} → {catalog.validTo}
        </p>
      </div>

      {/* DOWNLOAD (MINIMAL LINK STYLE) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <a
          href={catalog.filePath}
          download
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#16a34a",
            textDecoration: "none",
          }}
        >
          ⬇ {isAr ? "تحميل الكتالوج" : "Download Catalog"}
        </a>
      </div>

      {/* FLIPBOOK (NO CARD, NO BACKGROUND, NO BORDER) */}
      <div
        style={{
          width: "100%",
        }}
      >
        <CatalogFlipbook
          filePath={catalog.filePath}
          title={catalog.title}
        />
      </div>
    </div>
  );
}