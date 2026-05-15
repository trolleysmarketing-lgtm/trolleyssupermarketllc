import type { Metadata } from "next";
import { getPageMeta } from "@/lib/getPageMeta";
import ContactClient from "./ContactClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMeta("contact", locale);
}

export default function ContactPage() {
  return <ContactClient />;
}