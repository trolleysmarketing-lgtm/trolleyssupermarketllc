// src/app/api/gmb/find-places/route.ts
// TEMPORARY — delete after getting correct Place IDs
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

const SEARCHES = [
  "Trolleys Supermarket LLC Mirdif Dubai",
  "Trolleys Supermarket LLC Al Taawun Sharjah",
  "Trolleys Supermarket LLC Al Khan Sharjah",
  "Trolleys Supermarket LLC Al Nuaimia Ajman",
  "Trolleys Supermarket LLC Oasis Street Ajman",
];

export const dynamic = "force-dynamic";

export async function GET() {
  if (!API_KEY) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const results: any[] = [];

  for (const query of SEARCHES) {
    const url =
      `https://maps.googleapis.com/maps/api/findplacefromtext/json` +
      `?input=${encodeURIComponent(query)}` +
      `&inputtype=textquery` +
      `&fields=place_id,name,rating,user_ratings_total` +
      `&key=${API_KEY}`;

    const res  = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    results.push({
      query,
      status:    data.status,
      candidate: data.candidates?.[0] ?? null,
    });
  }

  return NextResponse.json({ results });
}