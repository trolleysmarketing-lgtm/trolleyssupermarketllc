import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "blog-categories.json");

const DEFAULT_CATEGORIES = ["News", "Health", "Tips", "Recipes", "Offers"];

async function readCategories(): Promise<string[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

async function writeCategories(cats: string[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(cats, null, 2), "utf-8");
}

export async function GET() {
  const cats = await readCategories();
  return NextResponse.json({ categories: cats });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const trimmed = (name || "").trim();
  if (!trimmed) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const cats = await readCategories();
  if (cats.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
    return NextResponse.json({ error: "Already exists" }, { status: 409 });
  }
  cats.push(trimmed);
  await writeCategories(cats);
  return NextResponse.json({ categories: cats });
}

export async function DELETE(req: NextRequest) {
  const { name } = await req.json();
  const cats = await readCategories();
  const updated = cats.filter(c => c !== name);
  await writeCategories(updated);
  return NextResponse.json({ categories: updated });
}