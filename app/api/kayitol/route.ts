import db from "@/lib/db";

type KayitIstekGirdisi = {
  email?: string;
  isim?: string;
  sifre?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as KayitIstekGirdisi;

    const isim = String(body.isim ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const sifre = String(body.sifre ?? "");

    if (!isim || !email || !sifre) {
      return Response.json(
        { error: "Lütfen tüm alanları doldurun" },
        { status: 400 }
      );
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO kullanicilar (isim, email, sifre)
         VALUES (?, ?, ?)`,
        [isim, email, sifre],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return Response.json({ message: "Kayıt başarılı" });
  } catch (error) {
    console.log(error);

    const sqliteError = error as { code?: string };
    if (sqliteError.code === "SQLITE_CONSTRAINT") {
      return Response.json(
        { error: "Bu e-posta ile zaten kayıt var" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Kayıt başarısız" }, { status: 500 });
  }
}
