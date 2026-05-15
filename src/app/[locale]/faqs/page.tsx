import type { Metadata } from "next";
import { getPageMeta } from "@/lib/getPageMeta";
import FAQsClient from "./FAQsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMeta("faqs", locale);
}

export default function FAQsPage() {
  return <FAQsClient />;
}