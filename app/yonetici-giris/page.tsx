"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Durum = "basari" | "hata" | "";

export default function YoneticiGirisPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/admin");

  const [key, setKey] = useState("");
  const [durum, setDurum] = useState<Durum>("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("next");
    if (target) {
      setNextPath(target);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim()) {
      setDurum("hata");
      setMesaj("Lütfen admin anahtarını girin.");
      return;
    }

    setLoading(true);
    setDurum("");
    setMesaj("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setDurum("hata");
        setMesaj(data.error || "Giriş başarısız.");
        return;
      }

      setDurum("basari");
      setMesaj(data.message || "Admin girişi başarılı.");
      setTimeout(() => router.push(nextPath), 400);
    } catch (error) {
      console.log(error);
      setDurum("hata");
      setMesaj("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          padding: 30,
          width: 320,
        }}
      >
        <h1 style={{ marginBottom: 18, textAlign: "center" }}>Yönetici Girişi</h1>
        <p style={{ color: "#666", marginBottom: 12, textAlign: "center" }}>
          Bu alan sadece panel yönetimi için.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Admin Anahtarı"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={{
              border: "1px solid #ccc",
              borderRadius: 5,
              marginBottom: 14,
              padding: 10,
              width: "100%",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#999" : "black",
              border: "none",
              borderRadius: 5,
              color: "white",
              padding: 10,
              width: "100%",
            }}
          >
            {loading ? "Kontrol ediliyor..." : "Panele Gir"}
          </button>
        </form>

        {mesaj && (
          <p
            style={{
              color: durum === "basari" ? "green" : "#c1121f",
              marginTop: 14,
              textAlign: "center",
            }}
          >
            {mesaj}
          </p>
        )}
      </div>
    </div>
  );
}
