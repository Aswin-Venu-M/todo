import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { getSupabaseConfig } from "@/utils/supabase/config";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "todo-app-dev-jwt-super-secret-key-12345";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function proxy(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();

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
      return redirectWithCookies(new URL("/board", request.url), supabaseResponse);
    } else {
      return redirectWithCookies(new URL("/login", request.url), supabaseResponse);
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return redirectWithCookies(loginUrl, supabaseResponse);
  }

  if (isAuthRoute && isAuthenticated) {
    return redirectWithCookies(new URL("/board", request.url), supabaseResponse);
  }

  return supabaseResponse;
}

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
