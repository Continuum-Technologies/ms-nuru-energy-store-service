import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "nuru_session";

// Optimistic check only — a fast redirect for the obvious "no cookie at all"
// case. It does NOT verify the session is valid or check permissions; that
// happens in requireStaffSession()/requirePermission() inside the admin
// layout and every Server Function. Per the Next.js 16 docs, Proxy "should
// not be used as a full session management or authorization solution."
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
