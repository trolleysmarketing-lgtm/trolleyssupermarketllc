import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "announcement.json");

const defaultData = {
  active: false,
  dismissible: true,
  bg: "#1C75BC",
  textColor: "#ffffff",
  text_en: "",
  text_ar: "",
  link_en: "",
  link_ar: "",
  link_label_en: "View Offers →",
  link_label_ar: "عرض العروض ←",
};

async function getData() {
  if (!existsSync(dataPath)) {
    const dir = path.join(process.cwd(), "data");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(dataPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-token");
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

// Public GET
export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}

// PUT — update announcement
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await writeFile(dataPath, JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true });
}