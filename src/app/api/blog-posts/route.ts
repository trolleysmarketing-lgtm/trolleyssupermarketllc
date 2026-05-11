import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "blog.json");
    if (!existsSync(dataPath)) return NextResponse.json({ posts: [] });
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    return NextResponse.json({ posts: data.posts || [] });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}