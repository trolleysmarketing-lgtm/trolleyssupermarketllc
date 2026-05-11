// src/app/api/gmb/connect/route.ts
// Step 1: Redirect admin to Google OAuth
// Step 2: Callback saves tokens to file

import { NextRequest, NextResponse } from "next/server";
import { writeTokens } from "@/lib/gmb-token";
import { isAuthenticated } from "@/lib/auth"; // your existing auth check

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "openid",
  "email",
].join(" ");

// GET /api/gmb/connect → redirect to Google
export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  // ── CALLBACK: code returned from Google ──────────────────────────────────
  if (code) {
    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri  = `${process.env.NEXTAUTH_URL}/api/gmb/connect`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/admin/google-business?gmb_error=${encodeURIComponent(err.error_description ?? "OAuth failed")}`
      );
    }

    const data = await tokenRes.json();

    if (!data.refresh_token) {
      // User already authorized before — need to revoke and re-authorize
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/admin/google-business?gmb_error=no_refresh_token`
      );
    }

    writeTokens({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expiry_date:   Date.now() + data.expires_in * 1000,
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/google-business?gmb_connected=1`
    );
  }

  // ── STEP 1: Redirect to Google OAuth ────────────────────────────────────
  const clientId    = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/gmb/connect`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id",     clientId);
  url.searchParams.set("redirect_uri",  redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope",         SCOPES);
  url.searchParams.set("access_type",   "offline");
  url.searchParams.set("prompt",        "consent"); // force refresh_token
  url.searchParams.set("state",         "gmb_connect");

  return NextResponse.redirect(url.toString());
}

// GET /api/gmb/connect/status → check if connected
export async function POST() {
  const { readTokens } = await import("@/lib/gmb-token");
  const tokens = readTokens();
  return NextResponse.json({ connected: !!tokens });
}