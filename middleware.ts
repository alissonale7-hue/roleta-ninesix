import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isAdminPage = path.startsWith("/admin");
  const isLoginPage = path.startsWith("/admin-login");
  const isAdminApi = path.startsWith("/api/admin");

  if (isLoginPage) return NextResponse.next();

  if (isAdminPage || isAdminApi) {
    const cookie = req.cookies.get("admin_auth")?.value;

    if (cookie !== "ok") {
      if (isAdminApi) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      const url = req.nextUrl.clone();
      url.pathname = "/admin-login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};