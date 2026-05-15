// src/app/api/gmb/reviews/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as { access_token?: string })?.access_token;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId  = searchParams.get("accountId");
  const locationId = searchParams.get("locationId");
  const pageToken  = searchParams.get("pageToken") ?? undefined;
  const pageSize   = searchParams.get("pageSize") ?? "50";

  if (!accountId || !locationId) {
    return NextResponse.json({ error: "accountId and locationId required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      pageSize,
      orderBy: "updateTime desc",
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "Reviews API error", details: data },
        { status: res.status }
      );
    }

    // Normalize reviews
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

    return NextResponse.json({
      reviews,
      totalReviewCount: data.totalReviewCount ?? reviews.length,
      averageRating:    data.averageRating ?? null,
      nextPageToken:    data.nextPageToken ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function starToNum(star: string): number {
  const map: Record<string, number> = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  };
  return map[star] ?? 0;
}