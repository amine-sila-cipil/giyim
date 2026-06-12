import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "inventtisi_auth";
const ADMIN_COOKIE_NAME = "admin_auth";

type AuthPayload = {
  email?: string;
  id?: number;
  rol?: string;
};

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

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const secret =
    process.env.JWT_SECRET ||
    process.env.ADMIN_PANEL_KEY ||
    "inventtisi-local-secret-change-me";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["verify"]
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`)
  );

  if (!isValid) return null;

  const decoded = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as AuthPayload & {
    exp?: number;
  };
  if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

  return decoded;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi = isAdminApiRequest(request);

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const hasAdminSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authPayload = authToken ? await verifyAuthToken(authToken) : null;
  const hasAdminRole = authPayload?.rol === "admin";

  if (hasAdminSession || hasAdminRole) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const loginUrl = new URL("/giris", request.url);
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
