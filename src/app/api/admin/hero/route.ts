import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "hero.json");

function isAuthorized(req: NextRequest): boolean {
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("x-admin-token");
  return token === process.env.ADMIN_SECRET;
}

async function getData() {
  if (!existsSync(dataPath)) {
    const dir = path.join(process.cwd(), "data");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const defaultData = { slides: [] };
    await writeFile(dataPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

export async function GET(req: NextRequest) {
  // Public endpoint — hero slider reads from this
  const data = await getData();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slides } = await req.json();
  await writeFile(dataPath, JSON.stringify({ slides }, null, 2));
  return NextResponse.json({ success: true });
}