import db from "@/lib/db";

export async function GET(): Promise<Response> {
  return new Promise<Response>((resolve) => {
    db.all("SELECT * FROM kategoriler ORDER BY ad ASC", [], (err, rows) => {
      if (err) {
        console.log("CATEGORY DB ERROR:", err);
        resolve(
          Response.json(
            { error: "Kategoriler alınamadı" },
            { status: 500 }
          )
        );
        return;
      }

      resolve(Response.json(rows));
    });
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { ad } = await req.json();
    const kategoriAdi = String(ad ?? "").trim();

    if (!kategoriAdi) {
      return Response.json(
        { error: "Kategori adı gerekli" },
        { status: 400 }
      );
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        "INSERT INTO kategoriler (ad) VALUES (?)",
        [kategoriAdi],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return Response.json({ message: "Kategori eklendi" });
  } catch (error) {
    console.log("CATEGORY INSERT ERROR:", error);
    const sqliteError = error as { code?: string };

    if (sqliteError.code === "SQLITE_CONSTRAINT") {
      return Response.json(
        { error: "Bu kategori zaten var" },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "Kategori eklenemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { id } = await req.json();
    const kategoriId = Number(id);

    if (!kategoriId) {
      return Response.json(
        { error: "Kategori seçilmedi" },
        { status: 400 }
      );
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        "UPDATE urunler SET kategori_id = NULL WHERE kategori_id = ?",
        [kategoriId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM kategoriler WHERE id = ?", [kategoriId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return Response.json({ message: "Kategori silindi" });
  } catch (error) {
    console.log("CATEGORY DELETE ERROR:", error);

    return Response.json(
      { error: "Kategori silinemedi" },
      { status: 500 }
    );
  }
}
