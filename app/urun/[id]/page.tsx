import db from "@/lib/db";
import SepeteEkle from "@/components/SepeteEkle";

async function getUrun(id: string) {
  return new Promise<any>((resolve, reject) => {
    db.get(
      `SELECT urunler.*, kategoriler.ad AS kategori_ad
       FROM urunler
       LEFT JOIN kategoriler ON kategoriler.id = urunler.kategori_id
       WHERE urunler.id = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

export default async function DetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const urun = await getUrun(id);

  if (!urun) {
    return <div>Ürün bulunamadı</div>;
  }

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div>
          {urun.resim ? (
            <img
              src={urun.resim}
              alt={urun.ad}
              style={{
                width: "100%",
                borderRadius: 20,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                alignItems: "center",
                background: "#eee",
                borderRadius: 20,
                color: "#888",
                display: "flex",
                height: 420,
                justifyContent: "center",
                width: "100%",
              }}
            >
              Resim Yok
            </div>
          )}
        </div>

        <div>
          {urun.kategori_ad && (
            <p
              style={{
                color: "#8f1f2c",
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              {urun.kategori_ad}
            </p>
          )}

          <h1
            style={{
              fontSize: 40,
              marginBottom: 20,
            }}
          >
            {urun.ad}
          </h1>

          <p
            style={{
              color: "#666",
              lineHeight: 1.8,
              fontSize: 18,
            }}
          >
            {urun.aciklama}
          </p>

          <h2
            style={{
              marginTop: 30,
              fontSize: 32,
            }}
          >
            {urun.fiyat} TL
          </h2>

          <p
            style={{
              marginTop: 10,
              fontSize: 18,
            }}
          >
            Stok: {urun.stok}
          </p>

          <SepeteEkle urun={urun} />
        </div>
      </div>
    </div>
  );
}
