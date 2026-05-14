import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    }
  );
  const data = await res.json();
  if (!data.candidates?.[0]) throw new Error(data.error?.message || "Gemini failed");
  return data.candidates[0].content.parts[0].text || "";
}

function parseJSON(raw: string): any {
  const attempts = [
    // 1. Strip fences, extract object
    () => {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    },
    // 2. Single-line JSON
    () => {
      for (const line of raw.split("\n")) {
        const t = line.trim();
        if (t.startsWith("{") && t.endsWith("}")) return JSON.parse(t);
      }
    },
    // 3. Fix unescaped newlines inside strings
    () => {
      const fixed = raw
        .replace(/```json/gi, "").replace(/```/g, "").trim()
        .replace(/("(?:[^"\\]|\\.)*")/g, m => m.replace(/\n/g, "\\n").replace(/\r/g, ""));
      const match = fixed.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    },
  ];
  for (const attempt of attempts) {
    try { const r = attempt(); if (r) return r; } catch {}
  }
  return null;
}

function normalizeNewlines(str: string): string {
  return (str || "").replace(/\\n/g, "\n");
}

export async function POST(req: NextRequest) {
  try {
    const { catalogTitle, catalogId, validFrom, validTo, coverBase64 } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

    // ── 1. Cover Image ──
    let coverImagePath = "";
    if (coverBase64) {
      try {
        const outputDir = path.join(process.cwd(), "public", "uploads", "covers");
        if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });
        const base64Data = (coverBase64 as string).replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        await writeFile(path.join(outputDir, `${catalogId}-cover.jpg`), buffer);
        coverImagePath = `/uploads/covers/${catalogId}-cover.jpg`;
      } catch (e: any) {
        console.warn("Cover save failed:", e.message);
      }
    }

    const validity = validFrom && validTo
      ? `Valid: ${validFrom} to ${validTo}.`
      : validFrom ? `Starting from: ${validFrom}.` : "";

    // ── 2. English Gemini call ──
    const enPrompt = `You are an SEO writer for Trolleys Supermarket UAE.
Branches: Mirdif (Dubai), Al Taawun (Sharjah), Al Khan (Sharjah), Al Nuaimia (Ajman).
Weekly catalog: "${catalogTitle}". ${validity}

Write a blog post IN ENGLISH ONLY. No Arabic words whatsoever.

Rules:
- title: SEO-friendly, do NOT start with "Discover", max 10 words
- excerpt: 2 sentences in English only, do NOT start with "Discover"
- content: 3 paragraphs + 2 FAQs + WhatsApp line
  * Paragraph 1: engaging intro (do NOT start with "Discover")
  * Paragraph 2: mention all 4 branch locations
  * Paragraph 3: shopping tips
  * FAQ format exactly:
    Q: question
    A: answer
  * Last line exactly: Join our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p

Return ONLY raw JSON, no markdown, no backticks, no explanation.
Use \\n for newlines inside strings.

{"title":"...","excerpt":"...","content":"para1\\n\\npara2\\n\\npara3\\n\\nQ: ...\\nA: ...\\n\\nQ: ...\\nA: ...\\n\\nJoin our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"}`;

    // ── 3. Arabic Gemini call ──
    const arPrompt = `أنت كاتب محتوى SEO لسوبرماركت تروليز الإمارات.
الفروع: مردف (دبي)، التعاون (الشارقة)، الخان (الشارقة)، النعيمية (عجمان).
كتالوج الأسبوع: "${catalogTitle}". ${validity}

اكتب منشور مدونة باللغة العربية فقط. لا تكتب أي كلمة بالإنجليزية إطلاقاً.

القواعد:
- title_ar: عنوان SEO جذاب، لا يبدأ بـ"اكتشف"، 10 كلمات كحد أقصى
- excerpt_ar: جملتان بالعربية فقط
- content_ar: 3 فقرات + سؤالان وجوابان + سطر واتساب
  * الفقرة 1: مقدمة جذابة
  * الفقرة 2: اذكر الفروع الأربعة
  * الفقرة 3: نصائح تسوق
  * تنسيق الأسئلة بالضبط:
    س: السؤال
    ج: الجواب
  * السطر الأخير بالضبط: انضم لقناتنا على واتساب: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p

أرجع JSON خام فقط، بدون markdown، بدون backticks، بدون شرح.
استخدم \\n للأسطر الجديدة داخل النصوص.

{"title_ar":"...","excerpt_ar":"...","content_ar":"فقرة1\\n\\nفقرة2\\n\\nفقرة3\\n\\nس: ...\\nج: ...\\n\\nس: ...\\nج: ...\\n\\nانضم لقناتنا على واتساب: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p"}`;

    console.log("Calling Gemini EN...");
    const enRaw = await callGemini(apiKey, enPrompt);
    console.log("EN RAW:", enRaw.slice(0, 300));

    console.log("Calling Gemini AR...");
    const arRaw = await callGemini(apiKey, arPrompt);
    console.log("AR RAW:", arRaw.slice(0, 300));

    const enData = parseJSON(enRaw);
    const arData = parseJSON(arRaw);

    console.log("EN parsed:", !!enData, "AR parsed:", !!arData);

    // ── 4. Build post ──
    const title    = normalizeNewlines(enData?.title    || `${catalogTitle} — Trolleys Supermarket UAE Weekly Offers`);
    const excerpt  = normalizeNewlines(enData?.excerpt  || `This week at Trolleys Supermarket UAE, incredible savings await across all branches. Check out the latest offers${validFrom ? ` valid from ${validFrom}` : ""}.`);
    const content  = normalizeNewlines(enData?.content  || `Shop the best weekly deals at Trolleys Supermarket across Mirdif (Dubai), Al Taawun (Sharjah), Al Khan (Sharjah), and Al Nuaimia (Ajman).\n\nVisit your nearest branch today and enjoy unbeatable prices on groceries, fresh produce, and more.\n\nJoin our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p`);

    const title_ar    = normalizeNewlines(arData?.title_ar    || `${catalogTitle} — عروض ترولييز سوبرماركت الأسبوعية`);
    const excerpt_ar  = normalizeNewlines(arData?.excerpt_ar  || `وفّر أكثر هذا الأسبوع مع ترولييز سوبرماركت في دبي والشارقة وعجمان.`);
    const content_ar  = normalizeNewlines(arData?.content_ar  || `تسوّق أفضل العروض الأسبوعية في ترولييز سوبرماركت في فروعنا: مردف (دبي)، التعاون (الشارقة)، الخان (الشارقة)، والنعيمية (عجمان).\n\nزر أقرب فرع إليك اليوم واستمتع بأسعار لا تُضاهى.\n\nانضم لقناتنا على واتساب: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p`);

    // ── 5. SEO Slug ──
    const year = new Date().getFullYear();
    const slug = `${slugify(title)}-${year}`;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const newPost = {
      slug, date, category: "Offers",
      title, title_ar,
      excerpt, excerpt_ar,
      content, content_ar,
      coverImage: coverImagePath,
      catalogId,
      autoGenerated: true,
    };

    // ── 6. Save ──
    const blogPath = path.join(process.cwd(), "data", "blog.json");
    let blogJson: { posts: any[] } = { posts: [] };
    if (existsSync(blogPath)) {
      blogJson = JSON.parse(await readFile(blogPath, "utf-8"));
    }
    blogJson.posts = blogJson.posts.filter((p: any) => p.catalogId !== catalogId);
    blogJson.posts.unshift(newPost);
    await writeFile(blogPath, JSON.stringify(blogJson, null, 2));

    return NextResponse.json({ success: true, post: newPost });

  } catch (err: any) {
    console.error("GENERATE BLOG ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}