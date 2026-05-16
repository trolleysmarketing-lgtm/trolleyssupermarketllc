// src/app/api/gmb/find-places/route.ts
// TEMPORARY - delete after use
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not set" }, { status: 500 });
  }

  try {
    const query = "Trolleys Supermarket Mirdif Dubai";
    const url = `https://maps.googleapis.com/maps/api/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}