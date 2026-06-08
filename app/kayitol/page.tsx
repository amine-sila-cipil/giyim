"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Durum = "basari" | "hata" | "";

export default function KayitOlPage() {
  const router = useRouter();
  const [isim, setIsim] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [durum, setDurum] = useState<Durum>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isim || !email || !sifre) {
      setDurum("hata");
      setMesaj("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    setDurum("");
    setMesaj("");

    try {
      const res = await fetch("/api/kayitol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isim, email, sifre }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setDurum("hata");
        setMesaj(data.error || "Kayıt işlemi başarısız.");
        return;
      }

      setDurum("basari");
      setMesaj(data.message || "Kayıt başarılı");
      setIsim("");
      setEmail("");
      setSifre("");

      setTimeout(() => {
        router.push("/giris");
      }, 700);
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
          padding: 25,
          width: 320,
        }}
      >
        <h1 style={{ marginBottom: 20, textAlign: "center" }}>Kayıt Ol</h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <input
            type="text"
            placeholder="İsim"
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            style={{ border: "1px solid #ccc", borderRadius: 5, padding: 10 }}
          />

          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: "1px solid #ccc", borderRadius: 5, padding: 10 }}
          />

          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            style={{ border: "1px solid #ccc", borderRadius: 5, padding: 10 }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#999" : "red",
              border: "none",
              borderRadius: 5,
              color: "white",
              cursor: loading ? "default" : "pointer",
              marginTop: 10,
              padding: 10,
            }}
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        {mesaj && (
          <p
            style={{
              color: durum === "basari" ? "green" : "#c1121f",
              marginTop: 15,
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
