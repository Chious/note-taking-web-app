import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/api/notes", "/api/user"];

// Define API routes that require authentication
const protectedApiRoutes = ["/api/notes", "/api/user"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute || isProtectedApiRoute) {
    // Use NextAuth JWT from cookies
    const session = await getToken({
      req: request as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      } else {
        // Redirect to home (login form) for web routes
        const loginUrl = new URL("/", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Optionally propagate user id if available
    const requestHeaders = new Headers(request.headers);
    if (session?.sub) {
      requestHeaders.set("x-user-id", String(session.sub));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
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
