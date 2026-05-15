import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPageMeta } from "@/lib/getPageMeta";
import LegalPage from "@/components/LegalPage";

type Section = { title: string; content: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMeta("terms", locale);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  
  return (
    <LegalPage
      title={t("title")}
      subtitle={t("subtitle")}
      intro={t("intro")}
      sections={t.raw("sections") as Section[]}
    />
  );
}