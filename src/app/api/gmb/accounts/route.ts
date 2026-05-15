// src/app/api/gmb/accounts/route.ts
import { NextResponse } from "next/server";
import { getValidToken } from "@/lib/gmb-token";

export async function GET() {
 
  let token: string;
  try {
    token = await getValidToken();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown";
    if (msg === "NOT_CONNECTED") {
      return NextResponse.json({ error: "NOT_CONNECTED" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  try {
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const accountsData = await accountsRes.json();
    if (!accountsRes.ok) {
      return NextResponse.json(
        { error: accountsData?.error?.message ?? "Accounts API error" },
        { status: 500 }
      );
    }

    const accounts = accountsData.accounts ?? [];

    const accountsWithLocations = await Promise.all(
      accounts.map(async (account: { name: string; accountName: string }) => {
        const accountId = account.name.split("/")[1];
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const locData = await locRes.json();
        const locations = (locData.locations ?? []).map((loc: { name: string; title: string }) => ({
          locationId:   loc.name.split("/")[1],
          locationName: loc.title,
          accountId,
        }));
        return { accountId, accountName: account.accountName, locations };
      })
    );

    return NextResponse.json({ accounts: accountsWithLocations });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}