import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  response.cookies.delete("admin_token");
  return response;
}