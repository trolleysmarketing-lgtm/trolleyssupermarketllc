// src/app/api/gmb/accounts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  const token   = (session as { access_token?: string })?.access_token;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key    = `accts:${token.slice(-20)}`;
  const cached = gc(key);
  if (cached) return NextResponse.json(cached);

  try {
    const accRes  = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const accData = await accRes.json();
    if (!accRes.ok) return NextResponse.json({ error: accData?.error?.message ?? "Accounts API error" }, { status: 500 });

    const accounts = accData.accounts ?? [];

    const result = await Promise.all(
      accounts.map(async (acc: { name: string; accountName: string; type: string }) => {
        const accountId = acc.name.split("/")[1];
        const locRes    = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress,phoneNumbers`,
          { headers: { Authorization: `Bearer ${token}` } }
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
        return { accountId, accountName: acc.accountName, locations };
      })
    );

    const payload = { accounts: result };
    sc(key, payload);
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}