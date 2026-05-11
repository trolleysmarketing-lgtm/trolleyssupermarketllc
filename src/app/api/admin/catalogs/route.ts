import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token");
    if (token?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataPath = path.join(process.cwd(), "data", "offers.json");
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ catalogs: [] });
  }
}