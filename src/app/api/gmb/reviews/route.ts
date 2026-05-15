// src/app/api/gmb/reviews/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

// ── In-memory cache (5 dakika) ──────────────────────────────────────────────
const cache = new Map<string, { data: unknown; exp: number }>();
const TTL   = 5 * 60 * 1000;

function gc(key: string) {
  const h = cache.get(key);
  if (!h) return null;
  if (Date.now() > h.exp) { cache.delete(key); return null; }
  return h.data;
}
function sc(key: string, data: unknown) {
  cache.set(key, { data, exp: Date.now() + TTL });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token   = (session as { access_token?: string })?.access_token;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId  = searchParams.get("accountId");
  const locationId = searchParams.get("locationId");
  const pageToken  = searchParams.get("pageToken") ?? "";
  const pageSize   = searchParams.get("pageSize") ?? "50";

  if (!accountId || !locationId)
    return NextResponse.json({ error: "accountId and locationId required" }, { status: 400 });

  // pageToken dahil cache key — "load more" farklı sayfa cache'lenir
  const key    = `reviews:${accountId}:${locationId}:${pageToken}:${pageSize}`;
  const cached = gc(key);
  if (cached) return NextResponse.json(cached);

  try {
    const params = new URLSearchParams({
      pageSize,
      orderBy: "updateTime desc",
      ...(pageToken ? { pageToken } : {}),
    });

    const res  = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    if (!res.ok)
      return NextResponse.json(
        { error: data?.error?.message ?? "Reviews API error", details: data },
        { status: res.status }
      );

    const reviews = (data.reviews ?? []).map((r: {
      reviewId: string;
      reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
      starRating: string;
      comment?: string;
      createTime: string;
      updateTime: string;
      reviewReply?: { comment: string; updateTime: string };
    }) => ({
      reviewId:   r.reviewId,
      author:     r.reviewer?.displayName ?? "Anonymous",
      photo:      r.reviewer?.profilePhotoUrl ?? null,
      anonymous:  r.reviewer?.isAnonymous ?? false,
      rating:     starToNum(r.starRating),
      text:       r.comment ?? "",
      createTime: r.createTime,
      updateTime: r.updateTime,
      timeMs:     new Date(r.createTime).getTime(),
      reply:      r.reviewReply
        ? { text: r.reviewReply.comment, time: r.reviewReply.updateTime }
        : null,
    }));

    const payload = {
      reviews,
      totalReviewCount: data.totalReviewCount ?? reviews.length,
      averageRating:    data.averageRating ?? null,
      nextPageToken:    data.nextPageToken ?? null,
    };

    sc(key, payload);
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

function starToNum(star: string): number {
  return ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as Record<string, number>)[star] ?? 0;
}