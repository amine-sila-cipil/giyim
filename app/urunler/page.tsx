"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Kategori = {
  id: number;
  ad: string;
};

export default function UrunlerPage() {
  const [urunler, setUrunler] = useState<any[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [aktifKategori, setAktifKategori] = useState("tum");

  const urunleriGetir = async () => {
    try {
      const res = await fetch("/api/urunler");
      const data = await res.json();
      setUrunler(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("HATA:", error);
    }
  };

  const kategorileriGetir = async () => {
    try {
      const res = await fetch("/api/kategoriler");
      const data = await res.json();
      setKategoriler(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("HATA:", error);
    }
  };

  useEffect(() => {
    urunleriGetir();
    kategorileriGetir();
  }, []);

  const filtrelenmisUrunler = useMemo(() => {
    if (aktifKategori === "tum") {
      return urunler;
    }

    return urunler.filter(
      (urun) => String(urun.kategori_id || "") === aktifKategori
    );
  }, [aktifKategori, urunler]);

  return (
    <div style={{ padding: 30 }}>
      <h1>Ürünler</h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 18,
        }}
      >
        <button
          type="button"
          onClick={() => setAktifKategori("tum")}
          style={{
            background: aktifKategori === "tum" ? "#8f1f2c" : "#fff",
            border: "1px solid #ddd",
            borderRadius: 999,
            color: aktifKategori === "tum" ? "#fff" : "#191614",
            cursor: "pointer",
            padding: "10px 14px",
          }}
        >
          Tüm Ürünler
        </button>

        {kategoriler.map((kategori) => (
          <button
            key={kategori.id}
            type="button"
            onClick={() => setAktifKategori(String(kategori.id))}
            style={{
              background:
                aktifKategori === String(kategori.id) ? "#8f1f2c" : "#fff",
              border: "1px solid #ddd",
              borderRadius: 999,
              color:
                aktifKategori === String(kategori.id) ? "#fff" : "#191614",
              cursor: "pointer",
              padding: "10px 14px",
            }}
          >
            {kategori.ad}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {filtrelenmisUrunler.map((urun) => (
          <Link
            href={`/urun/${urun.id}`}
            key={urun.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 15,
              background: "#fff",
              color: "inherit",
              display: "block",
              textDecoration: "none",
            }}
          >
            {urun.resim ? (
              <img
                src={urun.resim}
                alt={urun.ad}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 200,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  marginBottom: 10,
                  color: "#888",
                }}
              >
                Resim Yok
              </div>
            )}

            {urun.kategori_ad && (
              <p
                style={{
                  color: "#8f1f2c",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                {urun.kategori_ad}
              </p>
            )}
            <h2 style={{ fontSize: 18 }}>{urun.ad}</h2>
            <p style={{ color: "#666" }}>{urun.aciklama}</p>
            <p>
              Fiyat: <b>{urun.fiyat ?? 0} TL</b>
            </p>
            <p>Stok: {urun.stok ?? 0}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
