"use client";

import { useEffect, useState } from "react";

type Kategori = {
  id: number;
  ad: string;
};

export default function AdminPage() {
  const [urunler, setUrunler] = useState<any[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [kategoriAdi, setKategoriAdi] = useState("");

  const [form, setForm] = useState({
    ad: "",
    aciklama: "",
    fiyat: "",
    stok: "",
    resim: "",
    kategoriId: "",
  });

  const urunleriGetir = async () => {
    try {
      const res = await fetch("/api/urunler");
      const data = await res.json();
      setUrunler(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const kategorileriGetir = async () => {
    try {
      const res = await fetch("/api/kategoriler");
      const data = await res.json();
      setKategoriler(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    urunleriGetir();
    kategorileriGetir();
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        resim: data.path,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/urunler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        setForm({
          ad: "",
          aciklama: "",
          fiyat: "",
          stok: "",
          resim: "",
          kategoriId: "",
        });

        urunleriGetir();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const kategoriEkle = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/kategoriler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ad: kategoriAdi }),
      });

      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        setKategoriAdi("");
        kategorileriGetir();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const kategoriSil = async (kategori: Kategori) => {
    const onay = window.confirm(
      `"${kategori.ad}" kategorisi silinsin mi? Bu kategorideki ürünler silinmez.`
    );

    if (!onay) return;

    try {
      const res = await fetch("/api/kategoriler", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: kategori.id }),
      });

      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        if (form.kategoriId === String(kategori.id)) {
          setForm((mevcutForm) => ({ ...mevcutForm, kategoriId: "" }));
        }

        kategorileriGetir();
        urunleriGetir();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const urunSil = async (id: number) => {
    try {
      const res = await fetch("/api/urun-sil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      alert(data.message);

      urunleriGetir();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 30 }}>Admin Paneli</h1>

      <div
        style={{
          alignItems: "start",
          display: "grid",
          gap: 24,
          gridTemplateColumns: "minmax(280px, 420px) minmax(260px, 1fr)",
          marginBottom: 50,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 18,
          }}
        >
          <h2>Ürün Ekle</h2>

          <input
            name="ad"
            placeholder="Ürün adı"
            value={form.ad}
            onChange={handleChange}
            style={{ padding: 10 }}
          />

          <textarea
            name="aciklama"
            placeholder="Açıklama"
            value={form.aciklama}
            onChange={handleChange}
            style={{ padding: 10, minHeight: 100 }}
          />

          <input
            type="number"
            name="fiyat"
            placeholder="Fiyat"
            value={form.fiyat}
            onChange={handleChange}
            style={{ padding: 10 }}
          />

          <input
            type="number"
            name="stok"
            placeholder="Stok"
            value={form.stok}
            onChange={handleChange}
            style={{ padding: 10 }}
          />

          <select
            name="kategoriId"
            value={form.kategoriId}
            onChange={handleChange}
            style={{ padding: 10 }}
          >
            <option value="">Kategori seç</option>
            {kategoriler.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.ad}
              </option>
            ))}
          </select>

          <input type="file" onChange={handleImageUpload} />

          {form.resim && (
            <img
              src={form.resim}
              alt="Ürün ön izlemesi"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          )}

          <button
            type="submit"
            style={{
              padding: 12,
              background: "black",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Ürün Ekle
          </button>
        </form>

        <div
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <form
            onSubmit={kategoriEkle}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <h2>Kategori Ekle</h2>
            <input
              placeholder="Kategori adı"
              value={kategoriAdi}
              onChange={(event) => setKategoriAdi(event.target.value)}
              style={{ padding: 10 }}
            />
            <button
              type="submit"
              style={{
                padding: 12,
                background: "#8f1f2c",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Kategori Ekle
            </button>
          </form>

          <h3>Kategoriler</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {kategoriler.length === 0 ? (
              <p style={{ color: "#666" }}>Henüz kategori yok.</p>
            ) : (
              kategoriler.map((kategori) => (
                <div
                  key={kategori.id}
                  style={{
                    alignItems: "center",
                    background: "#fff1dc",
                    border: "1px solid #e4d8cc",
                    borderRadius: 8,
                    display: "flex",
                    gap: 10,
                    justifyContent: "space-between",
                    padding: "8px 10px",
                  }}
                >
                  <span>{kategori.ad}</span>
                  <button
                    type="button"
                    onClick={() => kategoriSil(kategori)}
                    style={{
                      background: "#b32635",
                      border: "none",
                      borderRadius: 6,
                      color: "white",
                      cursor: "pointer",
                      padding: "7px 10px",
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <h2>Ürünler</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {urunler.map((urun) => (
          <div
            key={urun.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 15,
            }}
          >
            {urun.resim && (
              <img
                src={urun.resim}
                alt={urun.ad}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
            )}

            <h3>{urun.ad}</h3>
            {urun.kategori_ad && (
              <p style={{ color: "#8f1f2c", fontWeight: 700 }}>
                {urun.kategori_ad}
              </p>
            )}
            <p>{urun.aciklama}</p>
            <p>
              <strong>{urun.fiyat} TL</strong>
            </p>
            <p>Stok: {urun.stok}</p>

            <button
              onClick={() => urunSil(urun.id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 10,
              }}
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
