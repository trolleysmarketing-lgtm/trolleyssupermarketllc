// src/app/api/gmb/accounts/route.ts
import { NextResponse } from "next/server";
import { getValidToken } from "@/lib/gmb-token";
import fs from "fs";
import path from "path";

// ── File-based cache — survives server restarts ───────────────────────────────
const CACHE_FILE = path.join(process.cwd(), ".gmb-accounts-cache.json");
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour

interface CacheEntry { accounts: unknown[]; cachedAt: number; }

function readCache(): CacheEntry | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const d: CacheEntry = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    if (Date.now() - d.cachedAt > CACHE_TTL) return null;
    return d;
  } catch { return null; }
}

function writeCache(accounts: unknown[]) {
  try { fs.writeFileSync(CACHE_FILE, JSON.stringify({ accounts, cachedAt: Date.now() }, null, 2)); }
  catch { /* ignore */ }
}

export async function GET(req: Request) {
  const refresh = new URL(req.url).searchParams.get("refresh") === "1";

  // ── Serve from cache ──────────────────────────────────────────────────────
  if (!refresh) {
    const cached = readCache();
    if (cached) {
      console.log("[GMB accounts] serving from cache");
      return NextResponse.json({ accounts: cached.accounts, fromCache: true });
    }
  }

  console.log("[GMB accounts] fetching from API...");

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

  try {
    const accountsRes  = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok) {
      return NextResponse.json(
        { error: accountsData?.error?.message ?? "Accounts API error" },
        { status: 500 }
      );
    }

    const accounts = accountsData.accounts ?? [];
    const result   = [];

    for (const account of accounts as { name: string; accountName: string }[]) {
      const accountId = account.name.split("/")[1];

      // 500ms delay between requests to avoid quota
      await new Promise(r => setTimeout(r, 500));

      const locRes  = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
      );
      const locData = await locRes.json();

      const locations = (locData.locations ?? []).map((loc: { name: string; title: string }) => ({
        locationId:   loc.name.split("/")[1],
        locationName: loc.title,
        accountId,
      }));

      result.push({ accountId, accountName: account.accountName, locations });
    }

    writeCache(result);
    console.log("[GMB accounts] cached for 1 hour");
    return NextResponse.json({ accounts: result, fromCache: false });

  } catch (e: unknown) {
    // On error, try stale cache
    const stale = readCache();
    if (stale) {
      console.log("[GMB accounts] API error, serving stale cache");
      return NextResponse.json({ accounts: stale.accounts, fromCache: true, stale: true });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}