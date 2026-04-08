import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // In production, check JWT token from NextAuth
    // For now, we allow access during development
    // TODO: Verify session token and role === ADMIN
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    // During development, allow access without auth
    if (process.env.NODE_ENV === "production" && !sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
