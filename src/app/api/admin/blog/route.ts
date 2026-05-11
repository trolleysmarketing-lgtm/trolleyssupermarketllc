import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "blog.json");

async function getData() {
  if (!existsSync(dataPath)) {
    const dataDir = path.join(process.cwd(), "data");
    if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
    await writeFile(dataPath, JSON.stringify({ posts: [] }, null, 2));
    return { posts: [] };
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
  const post = await req.json();
  const data = await getData();
  data.posts.unshift(post);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = await req.json();
  const data = await getData();
  const index = data.posts.findIndex((p: any) => p.slug === post.slug);
  if (index !== -1) data.posts[index] = post;
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await req.json();
  const data = await getData();
  data.posts = data.posts.filter((p: any) => p.slug !== slug);
  await writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}