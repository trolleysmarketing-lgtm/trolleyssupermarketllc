// src/app/api/admin/clear-cache/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-token");
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Revalidate all main pages
    const paths = ["/", "/en", "/ar", "/en/offers", "/ar/offers", "/en/blog", "/ar/blog", "/en/stores", "/ar/stores"];
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      revalidated: paths,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}