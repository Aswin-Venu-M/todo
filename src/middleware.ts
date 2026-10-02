import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "todo-app-dev-jwt-super-secret-key-12345";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload && payload.userId) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Protected route list
  const isProtectedRoute = pathname.startsWith("/board") || pathname.startsWith("/shared");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/board", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/board/:path*", "/shared", "/login", "/register"],
};
