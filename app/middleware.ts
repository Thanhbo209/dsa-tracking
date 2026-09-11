import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // Protect /problems and /problems/[slug]
  if (pathname.startsWith("/problems")) {
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect private API routes
  if (
    pathname.startsWith("/api/approaches") ||
    pathname.startsWith("/api/solutions") ||
    pathname.startsWith("/api/codes") ||
    pathname.startsWith("/api/submissions")
  ) {
    // Note: /api/submissions/import checks CORS/preflight & handles its own 401
    if (request.method === "OPTIONS") {
      return NextResponse.next();
    }

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/problems/:path*",
    "/api/approaches/:path*",
    "/api/solutions/:path*",
    "/api/codes/:path*",
    "/api/submissions/:path*",
  ],
};
