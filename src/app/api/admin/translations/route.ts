import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-token");
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

function getFilePath(locale: string): string {
  return path.join(process.cwd(), "messages", `${locale}.json`);
}

// Flatten nested object to dot-notation keys
function flatten(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flatten(obj[key], fullKey));
    } else if (typeof obj[key] === "string") {
      result[fullKey] = obj[key];
    }
    // Skip arrays — too complex to edit in simple UI
  }
  return result;
}

// Set nested value by dot-notation key
function setNestedValue(obj: any, keyPath: string, value: string): void {
  const keys = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const filePath = getFilePath(locale);

  if (!existsSync(filePath))
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const raw = JSON.parse(await readFile(filePath, "utf-8"));
  const flat = flatten(raw);
  return NextResponse.json({ flat, raw });
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { locale, updates } = await req.json();
  // updates: Record<string, string> — dot-notation key → new value

  const filePath = getFilePath(locale);
  if (!existsSync(filePath))
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const raw = JSON.parse(await readFile(filePath, "utf-8"));

  for (const [key, value] of Object.entries(updates as Record<string, string>)) {
    setNestedValue(raw, key, value);
  }

  await writeFile(filePath, JSON.stringify(raw, null, 2), "utf-8");
  return NextResponse.json({ success: true });
}