// app/[locale]/blog/[slug]/page.tsx
// ❌ "use client" SATIRINI KALDIRIN
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import Breadcrumb from "@/components/Breadcrumb";
import BlogPostClient from "./BlogPostClient"; // ✅ Client bileşeni import et
import type { Metadata } from "next";

type Post = {
  slug: string;
  title: string;
  title_ar?: string;
  date: string;
  category: string;
  excerpt: string;
  excerpt_ar?: string;
  content: string;
  content_ar?: string;
  coverImage?: string;
};

const blogImages: Record<string, string> = {
  "smart-grocery-shopping-uae-save-money-2026": "/blog/smart-grocery-shopping-uae.webp",
  "healthy-eating-dubai-affordable-supermarket-foods": "/blog/healthy-eating-dubai-supermarket.webp",
  "how-to-choose-fresh-meat-fruits-vegetables-uae": "/blog/fresh-food-uae-supermarket-guide.webp",
  "best-weekly-supermarket-deals-uae-trolleys": "/blog/uae-supermarket-weekly-offers.webp",
  "daily-life-uae-supermarkets-shopping-guide": "/blog/supermarket-lifestyle-uae-dubai.webp",
  "top-imported-foods-uae-supermarkets-trolleys": "/blog/imported-foods-uae-supermarket.webp",
};

const getImage = (post: Post) => post.coverImage || blogImages[post.slug] || "";

const cleanText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`/g, "")
    .replace(/^\s*\{[\s\S]*?\}\s*$/m, "")
    .replace(/^Discover amazing[^\n]*/im, "")
    .replace(/^Check out[^\n]*/im, "")
    .trim();
};

// ✅ generateMetadata sunucuda kalır
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };
  const title = locale === "ar" && post.title_ar ? post.title_ar : post.title;
  const excerpt = locale === "ar" && post.excerpt_ar ? post.excerpt_ar : post.excerpt;
  return {
    title: `${title} — Trolleys Supermarket UAE`,
    description: cleanText(excerpt).slice(0, 160),
    openGraph: { title, description: cleanText(excerpt).slice(0, 160), images: getImage(post) ? [getImage(post)] : [] },
  };
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const dataPath = path.join(process.cwd(), "data", "blog.json");
    if (!existsSync(dataPath)) return null;
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return data.posts?.find((p: Post) => p.slug === slug) || null;
  } catch { return null; }
}

async function getAllPosts(): Promise<Post[]> {
  try {
    const dataPath = path.join(process.cwd(), "data", "blog.json");
    if (!existsSync(dataPath)) return [];
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return data.posts || [];
  } catch { return []; }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const allPosts = await getAllPosts();
  if (!post) notFound();
  
  // ✅ Client bileşene verileri prop olarak geç
  return <BlogPostClient post={post} allPosts={allPosts} />;
}