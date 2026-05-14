import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-token");
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { base64, filename } = await req.json();
    if (!base64 || !filename)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const outputDir = path.join(process.cwd(), "public", "store");
    if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });

    const base64Data = (base64 as string).replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Sanitize filename
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const filePath = path.join(outputDir, safe);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, path: `/store/${safe}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}