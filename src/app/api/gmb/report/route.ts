// src/app/api/gmb/report/route.ts
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Period = "daily" | "weekly" | "monthly" | "all";

function periodCutoff(period: Period): number {
  const DAY = 86400000;
  const now = Date.now();
  if (period === "daily")   return now - DAY;
  if (period === "weekly")  return now - 7 * DAY;
  if (period === "monthly") return now - 30 * DAY;
  return 0;
}

function sentimentOf(rating: number) {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

interface RawReview {
  reviewId: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  timeMs: number;
}

interface RawBranch {
  placeId: string;
  name: string;
  city: string;
  rating: number;
  totalRatings: number;
  reviews: RawReview[];
}

export async function GET(req: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period      = (searchParams.get("period") ?? "weekly") as Period;
  const branchParam = searchParams.get("branches");
  const format      = (searchParams.get("format") ?? "csv") as "csv" | "json";
  const sentiment   = searchParams.get("sentiment") ?? undefined;

  const baseUrl = req.nextUrl.origin;

  let branches: RawBranch[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/gmb/places`, {
      headers: { Cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    const data = await res.json();
    branches = data.branches ?? [];
  } catch {
    return NextResponse.json({ error: "Failed to fetch places data" }, { status: 500 });
  }

  const requestedIds = branchParam ? branchParam.split(",").filter(Boolean) : branches.map(b => b.placeId);
  branches = branches.filter(b => requestedIds.includes(b.placeId));

  const cutoff = periodCutoff(period);

  const rows = branches.flatMap(b =>
    b.reviews
      .filter(r => {
        const inPeriod = cutoff === 0 || r.timeMs >= cutoff;
        const inSentiment = !sentiment || sentimentOf(r.rating) === sentiment;
        return inPeriod && inSentiment;
      })
      .sort((a, b) => b.timeMs - a.timeMs)
      .map(r => ({
        branch:    b.name,
        city:      b.city,
        author:    r.author,
        rating:    r.rating,
        sentiment: sentimentOf(r.rating),
        time:      r.time,
        text:      r.text ?? "",
      }))
  );

  const summary = branches.map(b => {
    const filtered = b.reviews.filter(r => cutoff === 0 || r.timeMs >= cutoff);
    const pos = filtered.filter(r => r.rating >= 4).length;
    const neg = filtered.filter(r => r.rating <= 2).length;
    const neu = filtered.filter(r => r.rating === 3).length;
    const avg = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.rating, 0) / filtered.length * 10) / 10 : null;
    return { branch: b.name, city: b.city, overallRating: b.rating, totalReviews: b.totalRatings, periodReviews: filtered.length, periodAvgRating: avg, positive: pos, neutral: neu, negative: neg };
  });

  if (format === "csv") {
    const esc = (v: string | number | null | undefined) => {
      const s = v === null || v === undefined ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines: string[] = [];
    lines.push("# SUMMARY");
    lines.push(["Branch","City","Overall Rating","Total Reviews","Period Reviews","Period Avg","Positive","Neutral","Negative"].join(","));
    summary.forEach(s => lines.push([s.branch, s.city, s.overallRating, s.totalReviews, s.periodReviews, s.periodAvgRating ?? "—", s.positive, s.neutral, s.negative].map(esc).join(",")));
    lines.push("");
    lines.push("# REVIEWS (newest first)");
    lines.push(["Branch","City","Author","Rating","Sentiment","Time","Comment"].join(","));
    rows.forEach(r => lines.push([r.branch, r.city, r.author, r.rating, r.sentiment, r.time, r.text].map(esc).join(",")));

    return new NextResponse("\uFEFF" + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="trolleys-report-${period}-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    meta: { generatedAt: new Date().toISOString(), period, branches: branches.length, totalRows: rows.length },
    summary,
    reviews: rows,
  });
}