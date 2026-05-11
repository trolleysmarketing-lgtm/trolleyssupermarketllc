import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "stores.json");

async function getData() {
  if (!existsSync(dataPath)) {
    const dataDir = path.join(process.cwd(), "data");
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
    await writeFile(dataPath, JSON.stringify({ stores: [] }, null, 2));
    return { stores: [] };
  }
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

function isAuthorized(req: NextRequest): boolean {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await req.json();
  const data = await getData();
  data.stores.push(store);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await req.json();
  const data = await getData();
  const index = data.stores.findIndex((s: any) => s.name === store.name);
  if (index !== -1) data.stores[index] = store;
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const data = await getData();
  data.stores = data.stores.filter((s: any) => s.name !== name);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}