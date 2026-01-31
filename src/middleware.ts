import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection is primarily handled client-side by layout hooks
 * (useAuth, useAdminAuth, useSuperAdminAuth) since Firebase tokens
 * are verified server-side and not available in Edge middleware.
 *
 * This middleware adds security headers and can be extended for
 * cookie-based session checks if needed.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
