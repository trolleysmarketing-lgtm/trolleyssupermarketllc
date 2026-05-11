// src/lib/gmb-token.ts
// Stores GMB OAuth tokens in a local file (no DB needed).
// Automatically refreshes access_token when expired.

import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), ".gmb-tokens.json");

interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number; // unix ms
}

export function readTokens(): TokenData | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function writeTokens(data: TokenData): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function clearTokens(): void {
  if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
}

// Returns a valid access_token, refreshing if needed
export async function getValidToken(): Promise<string> {
  const tokens = readTokens();
  if (!tokens) throw new Error("NOT_CONNECTED");

  // If token expires in less than 5 minutes, refresh it
  const isExpired = Date.now() > tokens.expiry_date - 5 * 60 * 1000;
  if (!isExpired) return tokens.access_token;

  // Refresh
  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    clearTokens(); // force reconnect
    throw new Error(err.error_description ?? "Token refresh failed");
  }

  const data = await res.json();
  const updated: TokenData = {
    access_token:  data.access_token,
    refresh_token: tokens.refresh_token, // refresh_token doesn't change
    expiry_date:   Date.now() + data.expires_in * 1000,
  };
  writeTokens(updated);
  return updated.access_token;
}