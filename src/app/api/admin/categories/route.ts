import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "categories.json");

type Category = {
  slug: string;
  name_en: string;
  name_ar: string;
  image: string;
  is_active: boolean;
  sort_order: number;
};

async function getData(): Promise<{ categories: Category[] }> {
  if (!existsSync(dataPath)) {
    const dir = path.join(process.cwd(), "data");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(dataPath, JSON.stringify({ categories: [] }, null, 2));
    return { categories: [] };
  }
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

function isAuthorized(req: NextRequest): boolean {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_SECRET;
}

// GET /api/admin/categories  — admin list (all)
// GET /api/admin/categories?public=1  — frontend (active only, sorted)
export async function GET(req: NextRequest) {
  const isPublic = req.nextUrl.searchParams.get("public") === "1";
  if (!isPublic && !isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getData();
  const cats = isPublic
    ? data.categories
        .filter((c) => c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
    : data.categories.sort((a, b) => a.sort_order - b.sort_order);

  return NextResponse.json({ categories: cats });
}

// POST — add new category
export async function POST(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cat: Category = await req.json();
  const data = await getData();

  if (data.categories.find((c) => c.slug === cat.slug))
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });

  cat.sort_order = data.categories.length;
  data.categories.push(cat);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

// PUT — update existing (matched by slug) OR reorder (body: { order: string[] })
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await getData();

  // Reorder: { order: ["slug1","slug2",...] }
  if (Array.isArray(body.order)) {
    body.order.forEach((slug: string, i: number) => {
      const c = data.categories.find((x) => x.slug === slug);
      if (c) c.sort_order = i;
    });
    await writeFile(dataPath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  }

  // Update single category
  const idx = data.categories.findIndex((c) => c.slug === body.slug);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.categories[idx] = { ...data.categories[idx], ...body };
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

// DELETE — { slug }
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await req.json();
  const data = await getData();
  data.categories = data.categories.filter((c) => c.slug !== slug);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}