"use client";
// src/app/[locale]/homepage/DynamicSections.tsx
import dynamic from "next/dynamic";

const OffersSection  = dynamic(() => import("./OffersSection"),  { ssr: false });
const ReviewsSection = dynamic(() => import("./ReviewsSection"), { ssr: false });
const BlogSection    = dynamic(() => import("./BlogSection"),    { ssr: false });
const StoresSection  = dynamic(() => import("./StoresSection"),  { ssr: false });

export default function DynamicSections({ locale, isRTL }: { locale: string; isRTL: boolean }) {
  return (
    <>
      <OffersSection  locale={locale} isRTL={isRTL} />
      <ReviewsSection locale={locale} />
      <BlogSection    locale={locale} isRTL={isRTL} />
      <StoresSection  locale={locale} isRTL={isRTL} />
    </>
  );
}