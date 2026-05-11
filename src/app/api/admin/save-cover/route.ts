import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { imageData, catalogId } = await req.json();

    // Create covers dir
    const coversDir = path.join(process.cwd(), "public", "uploads", "covers");
    if (!existsSync(coversDir)) {
      await mkdir(coversDir, { recursive: true });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const filePath = path.join(coversDir, `${catalogId}-cover.webp`);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, path: `/uploads/covers/${catalogId}-cover.webp` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save cover" }, { status: 500 });
  }
}