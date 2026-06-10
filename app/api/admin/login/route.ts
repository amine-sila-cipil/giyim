import { ADMIN_COOKIE_NAME } from "@/lib/auth";

const ADMIN_DEFAULT_KEY = "yilmazlar-admin-2026";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { key?: string };
    const key = String(body.key ?? "").trim();
    const adminKey = process.env.ADMIN_PANEL_KEY || ADMIN_DEFAULT_KEY;

    if (!key) {
      return Response.json({ error: "Anahtar gerekli" }, { status: 400 });
    }

    if (key !== adminKey) {
      return Response.json({ error: "Anahtar hatali" }, { status: 401 });
    }

    const response = Response.json({ message: "Admin girisi basarili" });
    const isProduction = process.env.NODE_ENV === "production";

    response.headers.append(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; ${
        isProduction ? "Secure;" : ""
      }`
    );

    return response;
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Giris yapilamadi" }, { status: 500 });
  }
}
