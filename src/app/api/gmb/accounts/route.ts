// src/app/api/gmb/accounts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as { access_token?: string })?.access_token;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Fetch accounts
    const accRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const accData = await accRes.json();
    if (!accRes.ok) {
      return NextResponse.json(
        { error: accData?.error?.message ?? "Accounts API error" },
        { status: 500 }
      );
    }

    const accounts = accData.accounts ?? [];

    // 2. Fetch locations for each account
    const result = await Promise.all(
      accounts.map(async (acc: { name: string; accountName: string; type: string }) => {
        const accountId = acc.name.split("/")[1];
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const locData = await locRes.json();
        const locations = (locData.locations ?? []).map((loc: {
          name: string;
          title: string;
          storefrontAddress?: { addressLines?: string[]; locality?: string };
          phoneNumbers?: { primaryPhone?: string };
        }) => ({
          locationId: loc.name.split("/").pop(),
          locationName: loc.title,
          address: loc.storefrontAddress?.addressLines?.[0] ?? "",
          city: loc.storefrontAddress?.locality ?? "",
          phone: loc.phoneNumbers?.primaryPhone ?? "",
          fullName: loc.name,
          accountId,
        }));
        return {
          accountId,
          accountName: acc.accountName,
          type: acc.type,
          locations,
        };
      })
    );

    return NextResponse.json({ accounts: result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}