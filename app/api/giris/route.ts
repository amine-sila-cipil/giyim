import db from "@/lib/db";

type GirisIstekGirdisi = {
  email?: string;
  sifre?: string;
};

type Kullanici = {
  email: string;
  id: number;
  isim: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as GirisIstekGirdisi;

    const email = String(body.email ?? "").trim().toLowerCase();
    const sifre = String(body.sifre ?? "");

    if (!email || !sifre) {
      return Response.json(
        { error: "Lütfen e-posta ve şifre girin" },
        { status: 400 }
      );
    }

    const kullanici = await new Promise<Kullanici | undefined>((resolve, reject) => {
      db.get(
        "SELECT id, isim, email FROM kullanicilar WHERE email = ? AND sifre = ?",
        [email, sifre],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(row as Kullanici | undefined);
        }
      );
    });

    if (!kullanici) {
      return Response.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    return Response.json({
      message: "Giriş başarılı",
      user: kullanici,
    });
  } catch (error) {
    console.log(error);

    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
