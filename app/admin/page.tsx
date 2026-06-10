"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Category = { id: number; ad: string };
type Product = {
  aciklama?: string;
  ad: string;
  alisFiyati?: number;
  fiyat?: number;
  id: number;
  kategori_ad?: string;
  kategori_id?: number | null;
  minimumStok?: number;
  resim?: string;
  satisFiyati?: number;
  stok?: number;
};

const tabs = ["dashboard", "urunler", "stok", "siparisler", "musteriler", "kilavuz"] as const;
type Tab = (typeof tabs)[number];

const tabLabels: Record<Tab, string> = {
  dashboard: "Dashboard",
  urunler: "ÃœrÃ¼nler",
  stok: "Stok",
  siparisler: "SipariÅŸler",
  musteriler: "MÃ¼ÅŸteriler",
  kilavuz: "KÄ±lavuz",
};

const emptyForm = {
  aciklama: "",
  ad: "",
  alisFiyati: "",
  fiyat: "",
  kategoriId: "",
  minimumStok: "5",
  resim: "",
  stok: "",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [urunler, setUrunler] = useState<Product[]>([]);
  const [kategoriler, setKategoriler] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [kategoriAdi, setKategoriAdi] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const kritikUrunler = useMemo(
    () => urunler.filter((urun) => Number(urun.stok) <= Number(urun.minimumStok ?? 5)),
    [urunler]
  );

  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ä°ÅŸlem baÅŸarÄ±sÄ±z");
    return data;
  };

  const loadAll = async () => {
    try {
      const [dash, productData, categories, orderData, userData, stockData] =
        await Promise.all([
          fetchJson("/api/admin/dashboard"),
          fetchJson(`/api/urunler${search ? `?q=${encodeURIComponent(search)}` : ""}`),
          fetchJson("/api/kategoriler"),
          fetchJson("/api/orders"),
          fetchJson("/api/users"),
          fetchJson("/api/stock/movements"),
        ]);

      setDashboard(dash);
      setUrunler(Array.isArray(productData) ? productData : productData.data || []);
      setKategoriler(categories);
      setOrders(orderData.data || []);
      setUsers(userData);
      setMovements(stockData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Veriler alÄ±namadÄ±");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    const result = await fetchJson("/api/upload", { method: "POST", body: data });
    setForm((current) => ({ ...current, resim: result.path }));
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      await fetchJson("/api/urunler", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      setForm(emptyForm);
      setEditingId(null);
      await loadAll();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ÃœrÃ¼n kaydedilemedi");
    }
  };

  const editProduct = (urun: Product) => {
    setEditingId(urun.id);
    setForm({
      aciklama: urun.aciklama || "",
      ad: urun.ad,
      alisFiyati: String(urun.alisFiyati || ""),
      fiyat: String(urun.satisFiyati ?? urun.fiyat ?? ""),
      kategoriId: String(urun.kategori_id || ""),
      minimumStok: String(urun.minimumStok ?? 5),
      resim: urun.resim || "",
      stok: String(urun.stok ?? ""),
    });
    setActiveTab("urunler");
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("ÃœrÃ¼n silinsin mi?")) return;
    await fetchJson("/api/urun-sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadAll();
  };

  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    await fetchJson("/api/kategoriler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad: kategoriAdi }),
    });
    setKategoriAdi("");
    await loadAll();
  };

  const updateOrder = async (id: number, status: string) => {
    await fetchJson("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadAll();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <nav>
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? "is-active" : ""}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <p>YÃ¶netim paneli</p>
            <h2>{tabLabels[activeTab]}</h2>
          </div>
          <div className="admin-search">
            <input
              placeholder="ÃœrÃ¼n ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button onClick={loadAll} type="button">Ara</button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="metric-grid">
              <Metric title="Toplam Ã¼rÃ¼n" value={dashboard?.totalProducts || 0} />
              <Metric title="Toplam sipariÅŸ" value={dashboard?.totalOrders || 0} />
              <Metric title="GÃ¼nlÃ¼k satÄ±ÅŸ" value={`${dashboard?.dailySales || 0} TL`} />
              <Metric title="AylÄ±k satÄ±ÅŸ" value={`${dashboard?.monthlySales || 0} TL`} />
              <Metric title="OkunmamÄ±ÅŸ bildirim" value={dashboard?.unreadNotifications || 0} />
            </div>
            <Panel title="Kritik stok uyarÄ±larÄ±">
              <Table
                headers={["ÃœrÃ¼n", "Stok", "Minimum"]}
                rows={kritikUrunler.map((urun) => [urun.ad, urun.stok, urun.minimumStok])}
              />
            </Panel>
            <Panel title="Son sipariÅŸler">
              <Table
                headers={["No", "MÃ¼ÅŸteri", "Tutar", "Durum"]}
                rows={orders.slice(0, 8).map((order) => [
                  `#${order.id}`,
                  order.user?.email,
                  `${order.totalAmount} TL`,
                  order.status,
                ])}
              />
            </Panel>
          </>
        )}

        {activeTab === "urunler" && (
          <div className="admin-grid">
            <form className="admin-form" onSubmit={saveProduct}>
              <h3>{editingId ? "ÃœrÃ¼n dÃ¼zenle" : "ÃœrÃ¼n ekle"}</h3>
              <input name="ad" placeholder="ÃœrÃ¼n adÄ±" value={form.ad} onChange={handleChange} />
              <textarea name="aciklama" placeholder="AÃ§Ä±klama" value={form.aciklama} onChange={handleChange} />
              <select name="kategoriId" value={form.kategoriId} onChange={handleChange}>
                <option value="">Kategori seÃ§</option>
                {kategoriler.map((kategori) => (
                  <option key={kategori.id} value={kategori.id}>{kategori.ad}</option>
                ))}
              </select>
              <div className="form-row">
                <input name="alisFiyati" placeholder="AlÄ±ÅŸ fiyatÄ±" type="number" value={form.alisFiyati} onChange={handleChange} />
                <input name="fiyat" placeholder="SatÄ±ÅŸ fiyatÄ±" type="number" value={form.fiyat} onChange={handleChange} />
              </div>
              <div className="form-row">
                <input name="stok" placeholder="Stok" type="number" value={form.stok} onChange={handleChange} />
                <input name="minimumStok" placeholder="Minimum stok" type="number" value={form.minimumStok} onChange={handleChange} />
              </div>
              <input type="file" onChange={handleImageUpload} />
              {form.resim && <img className="admin-preview" src={form.resim} alt="ÃœrÃ¼n Ã¶n izlemesi" />}
              <button type="submit">{editingId ? "GÃ¼ncelle" : "Ekle"}</button>
            </form>

            <div>
              <form className="category-form" onSubmit={addCategory}>
                <input placeholder="Kategori adÄ±" value={kategoriAdi} onChange={(event) => setKategoriAdi(event.target.value)} />
                <button type="submit">Kategori ekle</button>
              </form>
              <Panel title="ÃœrÃ¼n listesi">
                <div className="product-table">
                  {urunler.map((urun) => (
                    <article key={urun.id}>
                      {urun.resim && <img src={urun.resim} alt={urun.ad} />}
                      <div>
                        <strong>{urun.ad}</strong>
                        <span>{urun.kategori_ad || "Kategorisiz"}</span>
                        <small>{urun.fiyat} TL / Stok {urun.stok}</small>
                      </div>
                      <button onClick={() => editProduct(urun)} type="button">DÃ¼zenle</button>
                      <button onClick={() => deleteProduct(urun.id)} type="button">Sil</button>
                    </article>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === "stok" && (
          <>
            <Panel title="AnlÄ±k stok">
              <Table headers={["ÃœrÃ¼n", "Stok", "Kritik"]} rows={urunler.map((urun) => [urun.ad, urun.stok, Number(urun.stok) <= Number(urun.minimumStok) ? "Evet" : "HayÄ±r"])} />
            </Panel>
            <Panel title="Stok geÃ§miÅŸi">
              <Table headers={["Tarih", "ÃœrÃ¼n", "Tip", "Miktar", "Not"]} rows={movements.map((m) => [new Date(m.createdAt).toLocaleDateString("tr-TR"), m.product?.ad, m.type, m.quantity, m.note])} />
            </Panel>
          </>
        )}

        {activeTab === "siparisler" && (
          <Panel title="SipariÅŸ yÃ¶netimi">
            <div className="order-list">
              {orders.map((order) => (
                <article key={order.id}>
                  <div>
                    <strong>#{order.id} - {order.totalAmount} TL</strong>
                    <span>{order.user?.email} / {order.status}</span>
                  </div>
                  <div>
                    <button onClick={() => updateOrder(order.id, "KARGODA")} type="button">Kargoda</button>
                    <button onClick={() => updateOrder(order.id, "TESLIM_EDILDI")} type="button">Teslim edildi</button>
                    <button onClick={() => updateOrder(order.id, "IPTAL_EDILDI")} type="button">Ä°ptal</button>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        )}

        {activeTab === "musteriler" && (
          <Panel title="MÃ¼ÅŸteri yÃ¶netimi">
            <Table
              headers={["Ad soyad", "E-posta", "Rol", "Toplam harcama", "Son giriÅŸ"]}
              rows={users.map((user) => [
                `${user.ad} ${user.soyad}`.trim(),
                user.email,
                user.rol,
                `${user.totalSpent || 0} TL`,
                user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("tr-TR") : "-",
              ])}
            />
          </Panel>
        )}

        {activeTab === "kilavuz" && (
          <Panel title="Admin paneli kullanım kılavuzu">
            <div className="guide-content">
              <section className="guide-intro">
                <h4>Panelin amacı</h4>
                <p>Bu panel; ürünleri, stokları, siparişleri ve müşterileri tek yerden yönetmek için hazırlanmıştır. Günlük kullanımda önce Dashboard kontrol edilir, sonra stok ve sipariş durumlarına göre gerekli işlemler yapılır.</p>
              </section>

              <section>
                <h4>1. Giriş ve genel kullanım</h4>
                <ul>
                  <li>Admin paneline yönetici giriş sayfasından admin anahtarıyla girilir.</li>
                  <li>Başarılı girişten sonra admin paneli açılır.</li>
                  <li>Sol menüden Dashboard, Ürünler, Stok, Siparişler, Müşteriler ve Kılavuz bölümlerine geçilir.</li>
                  <li>Sağ üstteki arama alanı ürünleri ürün adına ve açıklamasına göre filtreler.</li>
                  <li>Bir işlemden sonra panel verileri otomatik yenilenir; gerekirse Ara düğmesiyle liste tekrar çekilir.</li>
                </ul>
              </section>

              <section>
                <h4>2. Dashboard ekranı</h4>
                <ul>
                  <li>Toplam ürün sayısı sistemde kayıtlı ürün adedini gösterir.</li>
                  <li>Toplam sipariş sayısı oluşturulmuş siparişlerin tamamını gösterir.</li>
                  <li>Günlük satış bugünkü iptal edilmemiş sipariş toplamıdır.</li>
                  <li>Aylık satış içinde bulunulan ayın iptal edilmemiş sipariş toplamıdır.</li>
                  <li>Okunmamış bildirim sayısı kritik stok, yeni sipariş ve durum değişikliği bildirimlerini hızlıca fark etmenizi sağlar.</li>
                  <li>Kritik stok uyarıları minimum stok seviyesine eşit veya altında kalan ürünleri gösterir.</li>
                  <li>Son siparişler yeni gelen siparişleri hızlı takip etmek için kullanılır.</li>
                </ul>
              </section>

              <section>
                <h4>3. Ürün ekleme</h4>
                <ul>
                  <li>Ürünler sekmesine girin.</li>
                  <li>Ürün adı alanını doldurun. Bu alan zorunludur.</li>
                  <li>Açıklama alanına kumaş, beden, renk veya kısa tanıtım bilgisini yazabilirsiniz.</li>
                  <li>Kategori seçin. Kategori yoksa önce kategori ekleme alanından yeni kategori oluşturun.</li>
                  <li>Alış fiyatı ürünü tedarik ederken ödediğiniz maliyettir.</li>
                  <li>Satış fiyatı müşteriye gösterilecek ve sipariş toplamında kullanılacak fiyattır.</li>
                  <li>Stok mevcut adet bilgisidir. Boş bırakılırsa 0 kabul edilir.</li>
                  <li>Minimum stok kritik stok uyarısının başlayacağı seviyedir. Boş bırakılırsa 5 kabul edilir.</li>
                  <li>Fotoğraf yüklemek isterseniz dosya seçme alanını kullanın.</li>
                  <li>Ekle düğmesine bastığınızda ürün kaydedilir ve liste yenilenir.</li>
                  <li>Aynı isimde ikinci ürün eklenemez.</li>
                  <li>Barkod alanı kullanıcıdan istenmez; sistem arka planda benzersiz iç ürün kodunu otomatik üretir.</li>
                </ul>
              </section>

              <section>
                <h4>4. Ürün düzenleme ve silme</h4>
                <ul>
                  <li>Ürün listesinden Düzenle düğmesine basın.</li>
                  <li>Seçilen ürünün bilgileri sol taraftaki forma taşınır.</li>
                  <li>Gerekli alanları değiştirin ve Güncelle düğmesine basın.</li>
                  <li>Ürün adını başka bir kayıtlı ürünün adıyla aynı yapamazsınız.</li>
                  <li>Stok değeri değişirse sistem bunu stok geçmişine düzeltme hareketi olarak kaydeder.</li>
                  <li>Sil düğmesi ürünü onay alarak kaldırır.</li>
                  <li>Silme işlemi geri alınamaz; yanlış ürün silmemek için ürün adını ve kategorisini kontrol edin.</li>
                </ul>
              </section>

              <section>
                <h4>5. Stok takibi</h4>
                <ul>
                  <li>Anlık stok bölümü ürünlerin mevcut stok durumunu gösterir.</li>
                  <li>Kritik sütunu ürünün minimum stok seviyesine inip inmediğini gösterir.</li>
                  <li>Stok geçmişi bölümünde giriş, çıkış, iade ve düzeltme hareketleri listelenir.</li>
                  <li>Ürün eklenirken girilen başlangıç stoğu giriş hareketi olarak yazılır.</li>
                  <li>Sipariş verildiğinde stok otomatik düşer ve çıkış hareketi oluşur.</li>
                  <li>Stok 0 olduğunda sistem o ürün için yeni sipariş kabul etmez.</li>
                  <li>Sipariş adedi mevcut stoktan fazlaysa sipariş oluşturulmaz.</li>
                  <li>Aynı anda iki sipariş gelse bile stok negatife düşmeyecek şekilde kontrol edilir.</li>
                </ul>
              </section>

              <section>
                <h4>6. Sipariş yönetimi</h4>
                <ul>
                  <li>Siparişler sekmesi en yeni siparişleri listeler.</li>
                  <li>Her siparişte sipariş numarası, toplam tutar, müşteri e-postası ve durum bilgisi görünür.</li>
                  <li>Kargoda düğmesi siparişi kargoya verilmiş olarak işaretler.</li>
                  <li>Teslim edildi düğmesi siparişi tamamlanmış olarak işaretler.</li>
                  <li>İptal düğmesi siparişi iptal durumuna alır.</li>
                  <li>Normal durum akışı Hazırlanıyor, Kargoda, Teslim edildi şeklindedir.</li>
                  <li>Sipariş oluştuğunda stok otomatik düşer; stok yoksa sipariş hiç oluşturulmaz.</li>
                </ul>
              </section>

              <section>
                <h4>7. Müşteri yönetimi</h4>
                <ul>
                  <li>Müşteriler sekmesinde sistemdeki kullanıcıları görebilirsiniz.</li>
                  <li>Ad soyad, e-posta, rol, toplam harcama ve son giriş bilgileri listelenir.</li>
                  <li>Toplam harcama kullanıcının sipariş toplamlarından hesaplanır.</li>
                  <li>Son giriş tarihi kullanıcının en son ne zaman giriş yaptığını gösterir.</li>
                </ul>
              </section>

              <section>
                <h4>8. Sık karşılaşılan uyarılar</h4>
                <ul>
                  <li>Bu isimde bir ürün zaten var: Aynı ürün adıyla tekrar kayıt yapılmaya çalışılmıştır.</li>
                  <li>Ürün adı gerekli: Ürün adı alanı boş bırakılmıştır.</li>
                  <li>Stok yetersiz: Sipariş adedi mevcut stoktan fazladır.</li>
                  <li>Stok bitti: Ürün stoğu 0 olduğu için sipariş alınmamıştır.</li>
                  <li>Kategoriler alınamadı: PostgreSQL bağlantısı çalışmıyor olabilir; Docker PostgreSQL container'ını kontrol edin.</li>
                </ul>
              </section>

              <section>
                <h4>9. Günlük önerilen iş akışı</h4>
                <ul>
                  <li>Güne Dashboard ekranını kontrol ederek başlayın.</li>
                  <li>Kritik stok uyarısı olan ürünleri Stok sekmesinden inceleyin.</li>
                  <li>Yeni siparişleri Siparişler sekmesinden kontrol edin.</li>
                  <li>Hazırlanan siparişleri Kargoda durumuna alın.</li>
                  <li>Teslim edilen siparişleri Teslim edildi olarak güncelleyin.</li>
                  <li>Yeni gelen ürünleri Ürünler sekmesinden ekleyin veya mevcut ürünlerin stoklarını güncelleyin.</li>
                  <li>Gün sonunda müşteri ve sipariş kayıtlarını hızlıca kontrol edin.</li>
                </ul>
              </section>
            </div>
          </Panel>
        )}

      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: ReactNode }) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="admin-panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Table({ headers, rows }: { headers: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length}>KayÄ±t yok</td></tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
