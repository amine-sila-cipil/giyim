import Link from "next/link";
import HomeSlider from "@/components/HomeSlider";

export default function Home() {
  return (
    <div className="home-page">
      <HomeSlider />

      <section className="home-highlights" aria-label="Alışveriş avantajları">
        <div>
          <span>01</span>
          <h2>Özenli Seçim</h2>
          <p>Sezonun en kullanışlı renkleri ve kalıpları önde tutuldu.</p>
        </div>
        <div>
          <span>02</span>
          <h2>Hızlı Keşif</h2>
          <p>Net görseller ve dengeli ölçülerle ürünleri rahatça inceleyin.</p>
        </div>
        <div>
          <span>03</span>
          <h2>Kolay Alışveriş</h2>
          <p>Sepete ekleyin, ödeme yönteminizi seçin ve siparişi tamamlayın.</p>
        </div>
      </section>

      <section className="home-collection">
        <div>
          <p className="section-kicker">Yeni sezon</p>
          <h2>Günlük stilinizi daha güçlü gösteren parçalar.</h2>
        </div>
        <Link className="section-link" href="/urunler">
          Tüm Ürünler
        </Link>
      </section>
    </div>
  );
}
