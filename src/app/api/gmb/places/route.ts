import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const DATA_FILE = path.join(process.cwd(), "data", "reviews-cache.json");

const PLACES = [
  { placeId: "ChIJZUCb8PBhXz4R6WVzYGgrCbg", name: "Trolleys - Mirdif", city: "Dubai" },
  { placeId: "ChIJA2zBYWZbXz4RueLlNhbVf_4", name: "Trolleys - Al Taawun", city: "Sharjah" },
  { placeId: "ChIJ2ZtxfsVbXz4R2A-fxX703hs", name: "Trolleys - Al Khan", city: "Sharjah" },
  { placeId: "ChIJ-6wNlfZZXz4REPMp59PqnpE", name: "Trolleys - Al Nuaimia", city: "Ajman" },
];

// Cache'den oku
function loadCache(): Record<string, any[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (e) {}
  return {};
}

// Cache'e yaz
function saveCache(data: Record<string, any[]>) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const cache = loadCache();

  try {
    const results = await Promise.all(
      PLACES.map(async (place) => {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.placeId}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK") return null;

        // Yeni yorumları cache'e ekle
        const newReviews = (data.result.reviews || []).map((r: any) => ({
          reviewId: `${place.placeId}-${r.time}`,
          author: r.author_name || "Anonymous",
          rating: r.rating || 0,
          text: r.text || "",
          time: r.relative_time_description || "",
          timeMs: (r.time || 0) * 1000,
          photo: r.profile_photo_url || "",
        }));

        // Eski yorumları getir, yenilerle birleştir
        const existing = cache[place.placeId] || [];
        const existingIds = new Set(existing.map((r: any) => r.reviewId));
        const merged = [...existing, ...newReviews.filter((r: any) => !existingIds.has(r.reviewId))];
        
        cache[place.placeId] = merged.slice(0, 50); // Max 50 yorum sakla

        return {
          placeId: place.placeId,
          name: data.result.name || place.name,
          city: place.city,
          rating: data.result.rating || 0,
          totalRatings: data.result.user_ratings_total || 0,
          reviews: merged,
        };
      })
    );

    saveCache(cache);
    return NextResponse.json({ branches: results.filter(Boolean) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}