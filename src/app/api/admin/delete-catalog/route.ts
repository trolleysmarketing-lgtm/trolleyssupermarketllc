import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token");
    if (token?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    const dataPath = path.join(process.cwd(), "data", "offers.json");
    const data = JSON.parse(await readFile(dataPath, "utf-8"));

    const catalog = data.catalogs.find((c: any) => c.id === id);
    if (catalog) {
      const filePath = path.join(process.cwd(), "public", catalog.filePath);
      if (existsSync(filePath)) await unlink(filePath);
    }

    data.catalogs = data.catalogs.filter((c: any) => c.id !== id);
    await writeFile(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}