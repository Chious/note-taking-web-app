import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/api/notes", "/api/user"];

// Define API routes that require authentication
const protectedApiRoutes = ["/api/notes", "/api/user"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute || isProtectedApiRoute) {
    // Get token from Authorization header or cookies
    let token: string | null = null;

    // Try to get token from Authorization header first
    const authHeader = request.headers.get("authorization");
    token = extractTokenFromHeader(authHeader);

    // If no Authorization header, try to get token from cookies
    if (!token) {
      token = request.cookies.get("auth-token")?.value || null;
    }

    // If no token found, redirect to login or return unauthorized
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      } else {
        // Redirect to login page for web routes
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      } else {
        // Redirect to login page for web routes
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Add user ID to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/register (registration endpoint)
     * - api/login (login endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/register|api/login|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
