import db from "@/lib/db";

export async function GET(): Promise<Response> {
  return new Promise<Response>((resolve) => {
    db.all(
      `SELECT urunler.*, kategoriler.ad AS kategori_ad
       FROM urunler
       LEFT JOIN kategoriler ON kategoriler.id = urunler.kategori_id
       ORDER BY urunler.id DESC`,
      [],
      (err, rows) => {
        if (err) {
          console.log("DB ERROR:", err);

          resolve(
            Response.json(
              { error: "Veritabanı hatası" },
              { status: 500 }
            )
          );

          return;
        }

        resolve(Response.json(rows));
      }
    );
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { ad, aciklama, fiyat, stok, resim, kategoriId } = await req.json();
    const secilenKategori = Number(kategoriId) || null;

    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO urunler (ad, aciklama, fiyat, stok, resim, kategori_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          ad,
          aciklama,
          Number(fiyat) || 0,
          Number(stok) || 0,
          resim || "",
          secilenKategori,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return Response.json({
      message: "Ürün eklendi",
    });
  } catch (error) {
    console.log("DB INSERT ERROR:", error);

    return Response.json(
      { error: "Ürün eklenemedi" },
      { status: 500 }
    );
  }
}
