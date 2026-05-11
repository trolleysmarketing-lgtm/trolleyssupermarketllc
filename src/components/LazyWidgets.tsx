"use client";

import dynamic from "next/dynamic";

const Chatbot      = dynamic(() => import("@/components/Chatbot"),      { ssr: false });
const SurveyWidget = dynamic(
  () => import("@/components/SurveyWidget").then(m => ({ default: m.SurveyWidget })),
  { ssr: false }
);

export function LazyWidgets({ locale }: { locale: string }) {
  return (
    <>
      <SurveyWidget locale={locale} />
      <Chatbot />
    </>
  );
}