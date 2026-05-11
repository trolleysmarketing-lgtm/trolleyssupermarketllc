// app/api/gmb/locations/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getValidToken } from "@/lib/gmb-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getValidToken(); // ✅ session parametresini KALDIR
    if (!token) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    const res = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GMB Locations Error:", error);
    return NextResponse.json({ locations: [] });
  }
}