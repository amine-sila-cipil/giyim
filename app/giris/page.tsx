"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Durum = "basari" | "hata" | "";

export default function GirisPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [durum, setDurum] = useState<Durum>("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("next");
    if (target?.startsWith("/")) {
      setNextPath(target);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !sifre) {
      setDurum("hata");
      setMesaj("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    setDurum("");
    setMesaj("");

    try {
      const res = await fetch("/api/giris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, sifre }),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        user?: { email: string; id: number; isim: string; rol?: string };
      };

      if (!res.ok) {
        setDurum("hata");
        setMesaj(data.error || "Giriş başarısız.");
        return;
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-changed"));
      }

      setDurum("basari");
      setMesaj(data.message || "Giriş başarılı");
      setEmail("");
      setSifre("");

      setTimeout(() => {
        const hedef = data.user?.rol === "admin" ? "/admin" : nextPath;
        router.push(hedef);
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
          padding: 30,
          width: 300,
        }}
      >
        <h1 style={{ marginBottom: 20, textAlign: "center" }}>Giriş Yap</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 10, padding: 10, width: "100%" }}
          />

          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            style={{ marginBottom: 15, padding: 10, width: "100%" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#999" : "red",
              border: "none",
              borderRadius: 5,
              color: "white",
              padding: 10,
              width: "100%",
            }}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
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
