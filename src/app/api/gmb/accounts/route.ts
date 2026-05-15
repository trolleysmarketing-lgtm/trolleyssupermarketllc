// src/app/api/gmb/accounts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// ── Cache: 30 dakika ─────────────────────────────────────────────────────────
const cache = new Map<string, { data: unknown; exp: number }>();
const TTL   = 30 * 60 * 1000; // 30 min

function getCache(key: string) {
  const h = cache.get(key);
  if (!h) return null;
  if (Date.now() > h.exp) { cache.delete(key); return null; }
  return h.data;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, exp: Date.now() + TTL });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const token   = (session as { access_token?: string })?.access_token;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Force refresh ?refresh=1 ile cache bypass
  const url     = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const key     = `accts:${token.slice(-20)}`;

  if (!refresh) {
    const cached = getCache(key);
    if (cached) {
      console.log("[GMB accounts] cache hit");
      return NextResponse.json(cached);
    }
  }

  console.log("[GMB accounts] fetching from API...");

  try {
    const accRes  = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const accData = await accRes.json();

    if (!accRes.ok) {
      const msg = accData?.error?.message ?? "Accounts API error";
      console.error("[GMB accounts] API error:", msg);
      return NextResponse.json({ error: msg }, { status: accRes.status });
    }

    const accounts = accData.accounts ?? [];
    if (accounts.length === 0) {
      const payload = { accounts: [] };
      setCache(key, payload);
      return NextResponse.json(payload);
    }

    // Fetch locations one at a time to avoid rate limit bursts
    const result = [];
    for (const acc of accounts as { name: string; accountName: string; type: string }[]) {
      const accountId = acc.name.split("/")[1];

      await new Promise(r => setTimeout(r, 300)); // 300ms delay between requests

      const locRes  = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress,phoneNumbers`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
      );
      const locData = await locRes.json();

      const locations = (locData.locations ?? []).map((loc: {
        name: string; title: string;
        storefrontAddress?: { addressLines?: string[]; locality?: string };
        phoneNumbers?: { primaryPhone?: string };
      }) => ({
        locationId:   loc.name.split("/").pop(),
        locationName: loc.title,
        city:         loc.storefrontAddress?.locality ?? "",
        phone:        loc.phoneNumbers?.primaryPhone ?? "",
        accountId,
      }));

      result.push({ accountId, accountName: acc.accountName, locations });
    }

    const payload = { accounts: result };
    setCache(key, payload);
    console.log("[GMB accounts] cached for 30 min");
    return NextResponse.json(payload);

  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[GMB accounts] exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}