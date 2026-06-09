"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const router = useRouter();
  const [girisYapildi, setGirisYapildi] = useState(false);

  const oturumKontrolEt = () => {
    setGirisYapildi(Boolean(localStorage.getItem("user")));
  };

  useEffect(() => {
    oturumKontrolEt();

    window.addEventListener("storage", oturumKontrolEt);
    window.addEventListener("auth-changed", oturumKontrolEt);

    return () => {
      window.removeEventListener("storage", oturumKontrolEt);
      window.removeEventListener("auth-changed", oturumKontrolEt);
    };
  }, []);

  const cikisYap = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  return (
    <header className="site-header">
      <h1 className="site-logo">
        <Link href="/">YILMAZLAR GİYİM</Link>
      </h1>

      <nav className="site-nav">
        <ul>
          <li>
            <Link href="/">Ana Sayfa</Link>
          </li>
          <li>
            <Link href="/urunler">Ürünler</Link>
          </li>
          {!girisYapildi && (
            <>
              <li>
                <Link href="/giris">Giriş</Link>
              </li>
              <li>
                <Link href="/kayitol">Kayıt Ol</Link>
              </li>
            </>
          )}
          <li>
            <Link href="/hakkimizda">Hakkımızda</Link>
          </li>
          <li>
            <Link href="/iletisim">İletişim</Link>
          </li>
          <li>
            <Link href="/sepet">Sepet</Link>
          </li>
          {girisYapildi && (
            <li>
              <button className="nav-logout" onClick={cikisYap} type="button">
                Çıkış Yap
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
