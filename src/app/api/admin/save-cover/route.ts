import { NextRequest, NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const { imageData, catalogId } = await req.json();

    const coversDir = path.join(process.cwd(), "public", "uploads", "covers");
    if (!existsSync(coversDir)) {
      await mkdir(coversDir, { recursive: true });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = path.join(coversDir, `${catalogId}-cover.webp`);

    // Optimize: resize to 600x338, convert to WebP quality 75
    await sharp(buffer)
      .resize(600, 338, { fit: "cover" })
      .webp({ quality: 75 })
      .toFile(filePath);

    return NextResponse.json({ success: true, path: `/uploads/covers/${catalogId}-cover.webp` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save cover" }, { status: 500 });
  }
}