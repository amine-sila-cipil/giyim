import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_auth";

function isAdminApiRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/urun-sil") return true;
  if (pathname === "/api/upload") return true;
  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login") return true;
  if (pathname.startsWith("/api/stock")) return true;
  if (pathname.startsWith("/api/users")) return true;
  if (pathname.startsWith("/api/notifications")) return true;
  if (pathname.startsWith("/api/orders") && request.method !== "POST") return true;
  if (pathname === "/api/urunler" && request.method !== "GET") return true;

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi = isAdminApiRequest(request);

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const hasAdminSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";

  if (hasAdminSession) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const loginUrl = new URL("/yonetici-giris", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/notifications/:path*",
    "/api/orders/:path*",
    "/api/stock/:path*",
    "/api/upload",
    "/api/urun-sil",
    "/api/urunler",
    "/api/users/:path*",
  ],
};
