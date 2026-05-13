import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = process.env.ADMIN_SECRET!;
    const response = NextResponse.json({ success: true, token });
    response.cookies.set("admin_token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}