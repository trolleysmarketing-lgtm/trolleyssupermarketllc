// src/app/api/gmb/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/gmb-token";
import { isAuthenticated } from "@/lib/auth";

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

function toStarNumber(rating: string): number {
  return STAR_MAP[rating] ?? 0;
}

function getSentiment(rating: string): "positive" | "neutral" | "negative" {
  const n = toStarNumber(rating);
  if (n >= 4) return "positive";
  if (n === 3) return "neutral";
  return "negative";
}

interface RawReview {
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: string;
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

interface PageResult {
  reviews: RawReview[];
  averageRating: number;
  totalReviewCount: number;
  nextPageToken?: string;
}

export async function GET(req: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let token: string;
  try {
    token = await getValidToken();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return NextResponse.json(
      { error: msg === "NOT_CONNECTED" ? "NOT_CONNECTED" : msg },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const accountId  = searchParams.get("accountId");
  const locationId = searchParams.get("locationId");
  const pageToken  = searchParams.get("pageToken") ?? undefined;
  const pageSize   = Math.min(Number(searchParams.get("pageSize") ?? 50), 50);
  const dateFrom   = searchParams.get("dateFrom") ?? undefined;
  const dateTo     = searchParams.get("dateTo") ?? undefined;
  const sentiment  = searchParams.get("sentiment") ?? undefined;
  const replied    = searchParams.get("replied") ?? undefined;
  const fetchAll   = searchParams.get("fetchAll") === "true";

  if (!accountId || !locationId) {
    return NextResponse.json({ error: "accountId and locationId are required" }, { status: 400 });
  }

  async function fetchPage(cursor: string | undefined): Promise<PageResult> {
    const params = new URLSearchParams({
      pageSize: String(pageSize),
      orderBy: "updateTime desc",
    });
    if (cursor) params.set("pageToken", cursor);

    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?${params}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `GMB API error: ${res.status}`);
    }
    return res.json();
  }

  try {
    let allReviews: RawReview[] = [];
    let nextPageToken: string | undefined;
    let averageRating = 0;
    let totalReviewCount = 0;

    if (fetchAll) {
      let cursor: string | undefined;
      let first = true;
      do {
        const data = await fetchPage(cursor);
        if (first) {
          averageRating    = data.averageRating;
          totalReviewCount = data.totalReviewCount;
          first = false;
        }
        allReviews.push(...(data.reviews ?? []));
        cursor = data.nextPageToken;
      } while (cursor);
    } else {
      const data = await fetchPage(pageToken);
      allReviews       = data.reviews ?? [];
      nextPageToken    = data.nextPageToken;
      averageRating    = data.averageRating;
      totalReviewCount = data.totalReviewCount;
    }

    let filtered = allReviews;

    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(r => new Date(r.updateTime) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.updateTime) <= to);
    }
    if (sentiment) filtered = filtered.filter(r => getSentiment(r.starRating) === sentiment);
    if (replied === "true")  filtered = filtered.filter(r => !!r.reviewReply);
    if (replied === "false") filtered = filtered.filter(r => !r.reviewReply);

    const enriched = filtered.map(r => ({
      ...r,
      starNumber:   toStarNumber(r.starRating),
      sentiment:    getSentiment(r.starRating),
      hasReply:     !!r.reviewReply,
      updateTimeMs: new Date(r.updateTime).getTime(),
    }));

    const filteredAvg = enriched.length
      ? enriched.reduce((s, r) => s + r.starNumber, 0) / enriched.length : 0;

    return NextResponse.json({
      reviews:           enriched,
      averageRating,
      filteredAvgRating: Math.round(filteredAvg * 10) / 10,
      totalReviewCount,
      filteredCount:     enriched.length,
      nextPageToken:     fetchAll ? undefined : nextPageToken,
      summary: {
        positive:  enriched.filter(r => r.sentiment === "positive").length,
        neutral:   enriched.filter(r => r.sentiment === "neutral").length,
        negative:  enriched.filter(r => r.sentiment === "negative").length,
        replied:   enriched.filter(r => r.hasReply).length,
        unreplied: enriched.filter(r => !r.hasReply).length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}