import { AUTH_COOKIE_NAME, hashPassword, signAuthToken, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

type GirisIstekGirdisi = {
  email?: string;
  sifre?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as GirisIstekGirdisi;
    const email = String(body.email ?? "").trim().toLowerCase();
    const sifre = String(body.sifre ?? "");

    if (!email || !sifre) {
      return Response.json({ error: "Lütfen e-posta ve şifre girin" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = user ? await verifyPassword(sifre, user.passwordHash) : false;

    if (!user || !isValid) {
      return Response.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const upgradedHash = user.passwordHash.startsWith("$2") ? undefined : await hashPassword(sifre);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(upgradedHash ? { passwordHash: upgradedHash } : {}),
      },
      select: { ad: true, email: true, id: true, rol: true, soyad: true },
    });

    const response = Response.json({
      message: "Giriş başarılı",
      user: {
        email: updated.email,
        id: updated.id,
        isim: `${updated.ad} ${updated.soyad}`.trim(),
        rol: updated.rol,
      },
    });

    response.headers.append(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${signAuthToken({ email: updated.email, id: updated.id, rol: updated.rol })}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
