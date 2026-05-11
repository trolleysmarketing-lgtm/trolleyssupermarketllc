import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://trolleyssupermarketllc.com";
  const response = NextResponse.redirect(`${baseUrl}/admin/login`);
  response.cookies.delete("admin_token");
  return response;
}