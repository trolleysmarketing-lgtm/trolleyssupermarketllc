import type { Metadata } from "next";
import { getPageMeta } from "@/lib/getPageMeta";
import StoresClient from "./StoresClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMeta("stores", locale);
}

export default function StoresPage() {
  return <StoresClient />;
}