import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const secret = process.env.ADMIN_SECRET;
  const cookieToken = cookieStore.get("admin_token")?.value;
  const headerToken = headerStore.get("x-admin-token");
  return cookieToken === secret || headerToken === secret;
}

export function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const cookieToken = req.cookies.get("admin_token")?.value;
  const headerToken = req.headers.get("x-admin-token");
  return cookieToken === secret || headerToken === secret;
}