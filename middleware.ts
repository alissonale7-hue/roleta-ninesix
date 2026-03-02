import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = req.nextUrl.pathname.startsWith("/admin-login");

  if (isLoginRoute) return NextResponse.next();

  if (isAdminRoute) {
    const cookie = req.cookies.get("admin_auth")?.value;

    if (cookie !== "ok") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin-login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};