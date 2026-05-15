// app/api/gmb/reply/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getValidToken } from "@/lib/gmb-token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getValidToken(); // ✅ session parametresini KALDIR
    if (!token) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }

    // ... devamı
  } catch (error) {
    console.error("GMB Reply Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}