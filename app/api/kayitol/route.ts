import { Prisma } from "@prisma/client";
import { AUTH_COOKIE_NAME, hashPassword, signAuthToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

type KayitIstekGirdisi = {
  ad?: string;
  email?: string;
  isim?: string;
  sifre?: string;
  soyad?: string;
};

function splitName(isim: string, soyad?: string) {
  if (soyad) return { ad: isim, soyad };
  const parts = isim.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { ad: parts[0] || "", soyad: "" };
  return { ad: parts.slice(0, -1).join(" "), soyad: parts.at(-1) || "" };
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as KayitIstekGirdisi;
    const email = String(body.email ?? "").trim().toLowerCase();
    const sifre = String(body.sifre ?? "");
    const isim = String(body.ad ?? body.isim ?? "").trim();
    const soyadGirdisi = String(body.soyad ?? "").trim();

    if (!isim || !email || !sifre) {
      return Response.json({ error: "Lutfen tum alanlari doldurun" }, { status: 400 });
    }

    if (sifre.length < 6) {
      return Response.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
    }

    const { ad, soyad } = splitName(isim, soyadGirdisi);
    const user = await prisma.user.create({
      data: {
        ad,
        soyad,
        email,
        passwordHash: await hashPassword(sifre),
        rol: "musteri",
      },
      select: { ad: true, email: true, id: true, rol: true, soyad: true },
    });

    const response = Response.json({
      message: "Kayit basarili",
      user: { email: user.email, id: user.id, isim: `${user.ad} ${user.soyad}`.trim(), rol: user.rol },
    });

    response.headers.append(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${signAuthToken({ email: user.email, id: user.id, rol: user.rol })}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu e-posta ile zaten kayit var" }, { status: 409 });
    }

    return Response.json({ error: "Kayit basarisiz" }, { status: 500 });
  }
}
