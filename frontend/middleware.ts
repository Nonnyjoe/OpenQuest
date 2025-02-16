import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const authToken = request.cookies.get("token")?.value;

  // We can see this in server logs
  console.log("Has auth token:", !!authToken);

  // Security Headers with updated CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
    frame-ancestors 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/blog",
    "/protocols",
    "/quizzes",
    "/admin",
    "/dashboard",
  ];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Admin routes that require authentication
  // const adminRoutes = ["/admin", "/dashboard"];
  // const isAdminRoute = adminRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route)
  // );

  // Handle routing logic
  // if (!authToken) {
  //   // If not authenticated
  //   if (isAdminRoute) {
  //     // Only redirect to login for admin routes
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // } else {
  //   // If authenticated
  //   if (isAuthPage) {
  //     // Redirect away from auth pages
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
