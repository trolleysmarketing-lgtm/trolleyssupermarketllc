import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!admin|api|_next/static|_next/image|favicon.ico|icons|images|hero-slider|categories|store|uploads|blog|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.pdf).*)",
  ],
};