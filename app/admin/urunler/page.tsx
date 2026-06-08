"use client";

import { useState } from "react";

export default function AdminUrunler() {
  const [form, setForm] = useState({
    ad: "",
    aciklama: "",
    fiyat: "",
    stok: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/urun", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    alert(data.message || data.error);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Ürün Ekle</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: 300,
        }}
      >
        <input name="ad" placeholder="Ürün adı" onChange={handleChange} />
        <input name="aciklama" placeholder="Açıklama" onChange={handleChange} />
        <input name="fiyat" placeholder="Fiyat" onChange={handleChange} />
        <input name="stok" placeholder="Stok" onChange={handleChange} />

        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
}
