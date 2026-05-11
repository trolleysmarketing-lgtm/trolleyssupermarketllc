import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token");
    if (token?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("pdf") as File;
    const title = formData.get("title") as string;
    const validFrom = formData.get("validFrom") as string;
    const validTo = formData.get("validTo") as string;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "catalogs");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const shortId = generateShortId();
    const fileName = `catalog-${shortId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const dataPath = path.join(process.cwd(), "data", "offers.json");
    const existing = JSON.parse(await readFile(dataPath, "utf-8"));

    const newCatalog = {
      id: shortId,
      title: title || "Weekly Catalog",
      fileName,
      filePath: `/uploads/catalogs/${fileName}`,
      shortLink: `/offers/${shortId}`,
      validFrom,
      validTo,
      createdAt: new Date().toISOString(),
      active: true,
    };

    existing.catalogs.unshift(newCatalog);
    await writeFile(dataPath, JSON.stringify(existing, null, 2));

    return NextResponse.json({ success: true, catalog: newCatalog });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}