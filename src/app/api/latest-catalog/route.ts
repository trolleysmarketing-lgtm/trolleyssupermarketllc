import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "offers.json");
    if (!existsSync(dataPath)) {
      return NextResponse.json({ catalog: null });
    }
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    const catalog = data.catalogs?.[0] || null;
    return NextResponse.json({ catalog });
  } catch {
    return NextResponse.json({ catalog: null });
  }
}