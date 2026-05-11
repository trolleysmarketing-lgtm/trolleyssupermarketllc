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
    const prompt = `You are an SEO writer for Trolleys Supermarket UAE (branches: Mirdif Dubai, Al Taawun Sharjah, Al Khan Sharjah, Al Nuaimia Ajman).

Write a blog post about their weekly offers catalog: "${catalogTitle}".
${validFrom && validTo ? `Valid: ${validFrom} to ${validTo}.` : ""}

English requirements:
- 200-250 words
- Use keywords: UAE supermarket offers, Dubai grocery deals, weekly discounts UAE
- Mention all 4 branches
- Include 2 FAQ at end (format: Q: question\\nA: answer)
- End with: Join our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p

Also write Arabic version (title_ar, excerpt_ar, content_ar).

CRITICAL: Return ONLY a single-line JSON. No markdown. No code blocks. No backticks. All string values must be on one line — use \\n for line breaks inside content strings.

Format exactly like this:
{"title":"English title here","excerpt":"English 2-sentence summary here","content":"Paragraph 1 text here.\\n\\nParagraph 2 text here.\\n\\nQ: First question?\\nA: First answer.\\n\\nQ: Second question?\\nA: Second answer.\\n\\nJoin our WhatsApp Channel: https://whatsapp.com/channel/0029VbBzYPDA2pL8dOLkNl2p","title_ar":"Arabic title here","excerpt_ar":"Arabic 2-sentence summary here","content_ar":"Arabic paragraph 1.\\n\\nArabic paragraph 2.\\n\\nس: سؤال أول?\\nج: جواب أول.\\n\\nس: سؤال ثاني?\\nج: جواب ثاني."}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
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
    console.log("RAW:", rawText.slice(0, 400));

    // ── 3. Parse JSON ──
    let blogData: any = null;

    // Try 1: direct JSON parse after cleaning
    try {
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        blogData = JSON.parse(match[0]);
      }
    } catch (e) {
      console.warn("JSON parse failed, trying fallback");
    }

    // Try 2: extract line by line
    if (!blogData) {
      try {
        const lines = rawText.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            blogData = JSON.parse(trimmed);
            break;
          }
        }
      } catch {}
    }

    // Fallback
    if (!blogData) {
      const cleanContent = rawText
        .replace(/```json[\s\S]*?```/g, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/```/g, "")
        .trim();

      blogData = {
        title: `${catalogTitle} — Trolleys Supermarket UAE Weekly Offers`,
        excerpt: `Discover amazing weekly deals at Trolleys Supermarket UAE. Valid ${validFrom || "now"} across Dubai, Sharjah and Ajman.`,
        content: cleanContent,
        title_ar: `${catalogTitle} — عروض ترولييز سوبرماركت الأسبوعية`,
        excerpt_ar: `اكتشف عروض رائعة في ترولييز. متاحة ${validFrom || "الآن"} في دبي والشارقة وعجمان.`,
        content_ar: cleanContent,
      };
    }

    // ── 4. SEO Slug ──
    const year = new Date().getFullYear();
    const slug = `${slugify(blogData.title || catalogTitle)}-${year}`;

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const newPost = {
      slug,
      title: blogData.title || catalogTitle,
      title_ar: blogData.title_ar || catalogTitle,
      date,
      category: "Offers",
      excerpt: blogData.excerpt || "",
      excerpt_ar: blogData.excerpt_ar || "",
      content: blogData.content || "",
      content_ar: blogData.content_ar || "",
      coverImage: coverImagePath,
      catalogId,
      autoGenerated: true,
    };

    // ── 5. Save ──
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
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}