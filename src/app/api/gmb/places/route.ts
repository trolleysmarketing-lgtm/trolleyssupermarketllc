// src/app/api/gmb/places/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_KEY   = process.env.GOOGLE_PLACES_API_KEY;
const DATA_FILE = path.join(process.cwd(), "data", "reviews-cache.json");

// ── Verified Place IDs ────────────────────────────────────────────────────────
const PLACES = [
  { placeId: "ChIJZQCb8PBhXz4R6WVzYGgrCbg", name: "Trolleys - Mirdif",    city: "Dubai"   },
  { placeId: "ChIJA2zBYWZbXz4RueLlNhbVf_4", name: "Trolleys - Al Taawun", city: "Sharjah" },
  { placeId: "ChIJ2ZtxfsVbXz4R2A-fxX703hs", name: "Trolleys - Al Khan",   city: "Sharjah" },
  { placeId: "ChIJ-6wNlfZZXz4REPMp59PqnpE", name: "Trolleys - Al Nuaimia",city: "Ajman"   },
];

interface CachedReview {
  reviewId: string;
  author:   string;
  rating:   number;
  text:     string;
  time:     string;
  timeMs:   number;
  photo:    string;
}

interface CacheStore {
  [placeId: string]: CachedReview[];
}

function loadCache(): CacheStore {
  try {
    if (fs.existsSync(DATA_FILE))
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch { /* ignore */ }
  return {};
}

function saveCache(data: CacheStore) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export const dynamic = "force-dynamic";

export async function GET() {
  if (!API_KEY)
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const cache = loadCache();

  try {
    const results = await Promise.all(
      PLACES.map(async (place) => {
        const url =
          `https://maps.googleapis.com/maps/api/place/details/json` +
          `?place_id=${place.placeId}` +
          `&fields=name,rating,user_ratings_total,reviews` +
          `&reviews_sort=newest` +
          `&key=${API_KEY}`;

        const res  = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        if (data.status !== "OK") {
          console.error(`[GMB] ${place.name}: ${data.status}`);
          return {
            placeId:      place.placeId,
            name:         place.name,
            city:         place.city,
            rating:       0,
            totalRatings: 0,
            reviews:      cache[place.placeId] ?? [],
          };
        }

        const incoming: CachedReview[] = (data.result.reviews ?? []).map((r: {
          author_name?:               string;
          rating?:                    number;
          text?:                      string;
          relative_time_description?: string;
          time?:                      number;
          profile_photo_url?:         string;
        }) => ({
          reviewId: `${place.placeId}-${r.time ?? Date.now()}`,
          author:   r.author_name               ?? "Anonymous",
          rating:   r.rating                    ?? 0,
          text:     r.text                      ?? "",
          time:     r.relative_time_description ?? "",
          timeMs:   (r.time ?? 0) * 1000,
          photo:    r.profile_photo_url         ?? "",
        }));

        // Merge with cache — no limit, newest first
        const existing    = cache[place.placeId] ?? [];
        const existingIds = new Set(existing.map(r => r.reviewId));
        const newOnes     = incoming.filter(r => !existingIds.has(r.reviewId));
        const merged      = [...newOnes, ...existing].sort((a, b) => b.timeMs - a.timeMs);

        cache[place.placeId] = merged;

        return {
          placeId:      place.placeId,
          name:         data.result.name              ?? place.name,
          city:         place.city,
          rating:       data.result.rating            ?? 0,
          totalRatings: data.result.user_ratings_total ?? 0,
          reviews:      merged,
        };
      })
    );

    saveCache(cache);
    return NextResponse.json({ branches: results });

  } catch (error: unknown) {
    const fallback = PLACES.map(place => ({
      placeId:      place.placeId,
      name:         place.name,
      city:         place.city,
      rating:       0,
      totalRatings: 0,
      reviews:      cache[place.placeId] ?? [],
    }));
    return NextResponse.json({
      branches:  fallback,
      fromCache: true,
      error:     error instanceof Error ? error.message : "Unknown error",
    });
  }
}