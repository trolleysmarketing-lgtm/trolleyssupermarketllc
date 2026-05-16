// src/app/api/gmb/disconnect/route.ts
import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/gmb-token";
import { isAuthenticated } from "@/lib/auth";

export async function POST() {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  clearTokens();
  return NextResponse.json({ success: true });
}