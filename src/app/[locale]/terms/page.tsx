import { useTranslations } from "next-intl";
import LegalPage from "@/components/LegalPage";

type Section = { title: string; content: string };

export default function TermsPage() {
  const t = useTranslations("terms");
  return (
    <LegalPage
      title={t("title")}
      subtitle={t("subtitle")}
      intro={t("intro")}
      sections={t.raw("sections") as Section[]}
    />
  );
}