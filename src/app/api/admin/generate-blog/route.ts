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

export async function POST(req: NextRequest) {
  try {
    const { catalogTitle, catalogId, filePath, validFrom, validTo, coverBase64 } = await req.json();

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

    // ── 2. Gemini ──
    const prompt = `You are an SEO content writer for Trolleys Supermarket UAE.
Branches: Mirdif (Dubai), Al Taawun (Sharjah), Al Khan (Sharjah), Al Nuaimia (Ajman).

Write a blog post about their weekly offers catalog titled: "${catalogTitle}".
${validFrom && validTo ? `Offer validity: ${validFrom} to ${validTo}.` : ""}

ENGLISH RULES:
- Title: creative, SEO-friendly, do NOT start with "Discover"
- Excerpt: 2 sentences, do NOT start with "Discover"
- Content: 200-250 words, 3-4 paragraphs
  * Paragraph 1: engaging intro about the offers (do NOT start with "Discover")
  * Paragraph 2: mention the 4 branch locations
  * Paragraph 3: shopping tips or product highlights
  * End with 2 FAQs in this exact format:
    Q: question here
    A: answer here
  * Final line: Join our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p

ARABIC RULES:
- title_ar, excerpt_ar, content_ar: full Arabic translation
- FAQ format in Arabic:
    س: سؤال هنا
    ج: جواب هنا

OUTPUT RULES — READ CAREFULLY:
- Return ONLY raw JSON, nothing else
- No markdown, no code fences, no backticks, no explanation
- All text must be on a single line — use literal \\n for newlines inside strings
- The JSON must be parseable with JSON.parse()

JSON structure:
{"title":"...","excerpt":"...","content":"paragraph1\\n\\nparagraph2\\n\\nparagraph3\\n\\nQ: ...\\nA: ...\\n\\nQ: ...\\nA: ...\\n\\nJoin our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p","title_ar":"...","excerpt_ar":"...","content_ar":"فقرة1\\n\\nفقرة2\\n\\nفقرة3\\n\\nس: ...\\nج: ...\\n\\nس: ...\\nج: ..."}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    console.log("GEMINI STATUS:", geminiRes.status);

    if (!geminiData.candidates?.[0]) {
      console.error("NO CANDIDATES:", JSON.stringify(geminiData));
      return NextResponse.json({ error: "Gemini failed: " + (geminiData.error?.message || "unknown") }, { status: 500 });
    }

    const rawText: string = geminiData.candidates[0].content.parts[0].text || "";
    console.log("RAW:", rawText.slice(0, 500));

    // ── 3. Parse JSON ── (multiple strategies)
    let blogData: any = null;

    // Strategy 1: strip markdown fences, extract JSON object
    try {
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        blogData = JSON.parse(match[0]);
        console.log("Parsed with strategy 1");
      }
    } catch (e) {
      console.warn("Strategy 1 failed:", e);
    }

    // Strategy 2: find first line that looks like JSON
    if (!blogData) {
      try {
        const lines = rawText.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            blogData = JSON.parse(trimmed);
            console.log("Parsed with strategy 2");
            break;
          }
        }
      } catch (e) {
        console.warn("Strategy 2 failed:", e);
      }
    }

    // Strategy 3: try to fix common Gemini JSON issues (unescaped newlines)
    if (!blogData) {
      try {
        const fixed = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
          // Replace literal newlines inside JSON string values with \n
          .replace(/("(?:[^"\\]|\\.)*")/g, (match) =>
            match.replace(/\n/g, "\\n").replace(/\r/g, "")
          );
        const match = fixed.match(/\{[\s\S]*\}/);
        if (match) {
          blogData = JSON.parse(match[0]);
          console.log("Parsed with strategy 3");
        }
      } catch (e) {
        console.warn("Strategy 3 failed:", e);
      }
    }

    // ── 4. Fallback — Gemini döndü ama parse olmadı ──
    // Raw text'i content olarak kullan, hardcode excerpt YOK
    if (!blogData) {
      console.warn("All JSON parse strategies failed, using raw text as content");
      const cleanContent = rawText
        .replace(/```json[\s\S]*?```/g, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/```/g, "")
        .replace(/^\s*\{[\s\S]*?\}\s*$/m, "")
        .trim();

      blogData = {
        title: `${catalogTitle} — Trolleys Supermarket UAE Weekly Offers`,
        excerpt: `This week at Trolleys Supermarket UAE, incredible savings await across all branches in Dubai, Sharjah and Ajman. Check out the latest offers valid ${validFrom ? `from ${validFrom}` : "now"}.`,
        content: cleanContent || `Shop the best weekly deals at Trolleys Supermarket across Mirdif (Dubai), Al Taawun (Sharjah), Al Khan (Sharjah), and Al Nuaimia (Ajman).\n\nVisit your nearest branch today and enjoy unbeatable prices on groceries, fresh produce, and more.\n\nJoin our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p`,
        title_ar: `${catalogTitle} — عروض ترولييز سوبرماركت الأسبوعية`,
        excerpt_ar: `وفّر أكثر هذا الأسبوع مع ترولييز سوبرماركت في دبي والشارقة وعجمان. تحقق من أحدث العروض المتاحة ${validFrom ? `اعتباراً من ${validFrom}` : "الآن"}.`,
        content_ar: cleanContent || `تسوّق أفضل العروض الأسبوعية في ترولييز سوبرماركت في فروعنا: مردف (دبي)، التعاون (الشارقة)، الخان (الشارقة)، والنعيمية (عجمان).\n\nزر أقرب فرع إليك اليوم واستمتع بأسعار لا تُضاهى على البقالة والمنتجات الطازجة والمزيد.`,
      };
    }

    // ── 5. Normalize \n — Gemini bazen literal "\\n" string döndürür ──
    const normalizeNewlines = (str: string): string => {
      if (!str) return "";
      // If the string contains literal \n sequences (not actual newlines), convert them
      return str.replace(/\\n/g, "\n");
    };

    blogData.content    = normalizeNewlines(blogData.content    || "");
    blogData.content_ar = normalizeNewlines(blogData.content_ar || "");
    blogData.excerpt    = normalizeNewlines(blogData.excerpt     || "");
    blogData.excerpt_ar = normalizeNewlines(blogData.excerpt_ar  || "");

    // ── 6. SEO Slug ──
    const year = new Date().getFullYear();
    const slug = `${slugify(blogData.title || catalogTitle)}-${year}`;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const newPost = {
      slug,
      title:      blogData.title      || catalogTitle,
      title_ar:   blogData.title_ar   || catalogTitle,
      date,
      category:   "Offers",
      excerpt:    blogData.excerpt     || "",
      excerpt_ar: blogData.excerpt_ar  || "",
      content:    blogData.content     || "",
      content_ar: blogData.content_ar  || "",
      coverImage: coverImagePath,
      catalogId,
      autoGenerated: true,
    };

    // ── 7. Save ──
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