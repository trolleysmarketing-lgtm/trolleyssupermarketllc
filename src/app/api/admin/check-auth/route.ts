import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;

  // Cookie kontrolü
  const cookieToken = req.cookies.get("admin_token")?.value;
  // Header kontrolü (localStorage'dan gelen)
  const headerToken = req.headers.get("x-admin-token");

  if (
    (cookieToken && cookieToken === secret) ||
    (headerToken && headerToken === secret)
  ) {
    return NextResponse.json({ authorized: true });
  }
  return NextResponse.json({ authorized: false }, { status: 401 });
}