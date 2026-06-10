"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SepetUrunu = {
  id: number;
  ad: string;
  aciklama?: string;
  fiyat?: number;
  stok?: number;
  resim?: string;
  adet?: number;
};

function sepeteOku(): SepetUrunu[] {
  try {
    const kayitliSepet = localStorage.getItem("sepet");
    const sepet = kayitliSepet ? JSON.parse(kayitliSepet) : [];

    return Array.isArray(sepet) ? sepet : [];
  } catch {
    return [];
  }
}

export default function SepetPage() {
  const [sepet, setSepet] = useState<SepetUrunu[]>([]);
  const [odemeYontemi, setOdemeYontemi] = useState("kart");
  const [adres, setAdres] = useState({
    adSoyad: "",
    telefon: "",
    sehir: "",
    detay: "",
  });

  useEffect(() => {
    setSepet(sepeteOku());
  }, []);

  const toplam = useMemo(() => {
    return sepet.reduce((sonuc, urun) => {
      return sonuc + (Number(urun.fiyat) || 0) * (urun.adet || 1);
    }, 0);
  }, [sepet]);

  const sepetiKaydet = (yeniSepet: SepetUrunu[]) => {
    setSepet(yeniSepet);
    localStorage.setItem("sepet", JSON.stringify(yeniSepet));
  };

  const adetDegistir = (id: number, adet: number) => {
    const yeniSepet = sepet
      .map((urun) => (urun.id === id ? { ...urun, adet } : urun))
      .filter((urun) => (urun.adet || 1) > 0);

    sepetiKaydet(yeniSepet);
  };

  const urunSil = (id: number) => {
    sepetiKaydet(sepet.filter((urun) => urun.id !== id));
  };

  const adresDegistir = (
    alan: "adSoyad" | "telefon" | "sehir" | "detay",
    deger: string
  ) => {
    setAdres((mevcutAdres) => ({
      ...mevcutAdres,
      [alan]: deger,
    }));
  };

  const odemeYap = () => {
    if (!adres.adSoyad.trim() || !adres.telefon.trim() || !adres.detay.trim()) {
      alert("Lütfen teslimat adresi bilgilerini doldurun.");
      return;
    }

    const kayitliKullanici = localStorage.getItem("user");
    const kullanici = kayitliKullanici ? JSON.parse(kayitliKullanici) : null;

    if (!kullanici?.id) {
      alert("Sipariş vermek için lütfen giriş yapın.");
      return;
    }

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: kullanici.id,
        items: sepet.map((urun) => ({ productId: urun.id, adet: urun.adet || 1 })),
        address: adres,
        paymentMethod: odemeYontemi,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sipariş oluşturulamadı");
        localStorage.removeItem("sepet");
        setSepet([]);
        alert("Ödeme bilgileriniz alındı. Siparişiniz hazırlanıyor.");
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : "Sipariş oluşturulamadı");
      });
  };

  if (sepet.length === 0) {
    return (
      <div className="empty-cart">
        <p className="section-kicker">Sepet</p>
        <h1>Sepetiniz boş.</h1>
        <p>Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayın.</p>
        <Link className="section-link" href="/urunler">
          Ürünlere Git
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-heading">
        <p>Alışveriş özeti</p>
        <h1>Sepet</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {sepet.map((urun) => (
            <div className="cart-item" key={urun.id}>
              <Link href={`/urun/${urun.id}`}>
                {urun.resim ? (
                  <img src={urun.resim} alt={urun.ad} />
                ) : (
                  <div className="cart-item__placeholder" />
                )}
              </Link>

              <div className="cart-item__info">
                <Link href={`/urun/${urun.id}`}>{urun.ad}</Link>
                <p>{urun.fiyat ?? 0} TL</p>
                <label>
                  Adet
                  <input
                    min={1}
                    type="number"
                    value={urun.adet || 1}
                    onChange={(event) =>
                      adetDegistir(urun.id, Number(event.target.value))
                    }
                  />
                </label>
              </div>

              <button onClick={() => urunSil(urun.id)} type="button">
                Sil
              </button>
            </div>
          ))}
        </div>

        <aside className="payment-panel" aria-label="Ödeme bölümü">
          <div className="payment-total">
            <span>Toplam</span>
            <strong>{toplam} TL</strong>
          </div>

          <div className="address-form">
            <h2>Teslimat Adresi</h2>
            <input
              placeholder="Ad soyad"
              type="text"
              value={adres.adSoyad}
              onChange={(event) => adresDegistir("adSoyad", event.target.value)}
            />
            <input
              placeholder="Telefon"
              inputMode="tel"
              type="tel"
              value={adres.telefon}
              onChange={(event) => adresDegistir("telefon", event.target.value)}
            />
            <input
              placeholder="İl / İlçe"
              type="text"
              value={adres.sehir}
              onChange={(event) => adresDegistir("sehir", event.target.value)}
            />
            <textarea
              placeholder="Açık adres"
              value={adres.detay}
              onChange={(event) => adresDegistir("detay", event.target.value)}
            />
          </div>

          <div className="payment-methods">
            <label className={odemeYontemi === "kart" ? "is-selected" : ""}>
              <input
                checked={odemeYontemi === "kart"}
                name="odeme"
                onChange={() => setOdemeYontemi("kart")}
                type="radio"
              />
              Kredi / Banka Kartı
            </label>
            <label className={odemeYontemi === "havale" ? "is-selected" : ""}>
              <input
                checked={odemeYontemi === "havale"}
                name="odeme"
                onChange={() => setOdemeYontemi("havale")}
                type="radio"
              />
              Havale / EFT
            </label>
            <label className={odemeYontemi === "kapida" ? "is-selected" : ""}>
              <input
                checked={odemeYontemi === "kapida"}
                name="odeme"
                onChange={() => setOdemeYontemi("kapida")}
                type="radio"
              />
              Kapıda Ödeme
            </label>
          </div>

          {odemeYontemi === "kart" && (
            <div className="payment-form">
              <input placeholder="Kart üzerindeki isim" type="text" />
              <input placeholder="Kart numarası" inputMode="numeric" type="text" />
              <div>
                <input placeholder="AA/YY" inputMode="numeric" type="text" />
                <input placeholder="CVV" inputMode="numeric" type="password" />
              </div>
            </div>
          )}

          {odemeYontemi === "havale" && (
            <div className="payment-note">
              <strong>Banka bilgileri</strong>
              <p>Yılmazlar Giyim - TR00 0000 0000 0000 0000 0000 00</p>
            </div>
          )}

          {odemeYontemi === "kapida" && (
            <div className="payment-note">
              <strong>Kapıda ödeme</strong>
              <p>Sipariş tesliminde nakit veya kart ile ödeme yapabilirsiniz.</p>
            </div>
          )}

          <button className="payment-button" onClick={odemeYap} type="button">
            Ödeme Yap
          </button>
        </aside>
      </div>
    </div>
  );
}
