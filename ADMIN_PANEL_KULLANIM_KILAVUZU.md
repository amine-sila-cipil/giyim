# Admin Paneli Kullanım Kılavuzu

Bu kılavuz, Inventtisi Giyim admin panelinin günlük kullanımını adım adım açıklar.

## 1. Giriş

1. `/yonetici-giris` sayfasına gidin.
2. Admin anahtarını girin.
3. Giriş başarılı olursa `/admin` paneli açılır.
4. Sol menüden Dashboard, Ürünler, Stok, Siparişler, Müşteriler ve Kılavuz bölümlerine geçebilirsiniz.

## 2. Dashboard

Dashboard, mağazanın günlük durumunu hızlıca görmeniz için hazırlanmıştır.

- Toplam ürün: Sistemde kayıtlı ürün sayısıdır.
- Toplam sipariş: Oluşturulan tüm siparişlerin sayısıdır.
- Günlük satış: Bugünkü iptal edilmemiş siparişlerin toplamıdır.
- Aylık satış: İçinde bulunulan ayın iptal edilmemiş sipariş toplamıdır.
- Okunmamış bildirim: Kritik stok, yeni sipariş ve durum değişikliği bildirimlerini gösterir.
- Kritik stok uyarıları: Stoğu minimum stok seviyesine eşit veya altında olan ürünleri listeler.
- Son siparişler: En yeni siparişleri hızlı takip etmek için kullanılır.

## 3. Ürün Ekleme

Ürün eklemek için:

1. **Ürünler** sekmesine girin.
2. Ürün adını yazın. Bu alan zorunludur.
3. Açıklama alanına ürünün kumaş, renk, beden veya kısa tanıtım bilgisini yazın.
4. Kategori seçin. Kategori yoksa önce kategori ekleyin.
5. Alış fiyatını girin.
6. Satış fiyatını girin.
7. Stok adedini girin.
8. Minimum stok seviyesini girin.
9. İsterseniz ürün fotoğrafı yükleyin.
10. **Ekle** düğmesine basın.

Kurallar:

- Aynı isimde ikinci ürün eklenemez.
- Barkod alanı ekranda yoktur; sistem benzersiz iç ürün kodunu otomatik oluşturur.
- Satış fiyatı boş bırakılırsa `0` kabul edilir.
- Stok boş bırakılırsa `0` kabul edilir.
- Minimum stok boş bırakılırsa `5` kabul edilir.

## 4. Ürün Düzenleme ve Silme

Ürün düzenlemek için:

1. Ürün listesinden **Düzenle** düğmesine basın.
2. Ürün bilgileri forma taşınır.
3. Gerekli alanları değiştirin.
4. **Güncelle** düğmesine basın.

Dikkat edilmesi gerekenler:

- Ürün adı başka bir ürünle aynı yapılamaz.
- Stok değişirse bu işlem stok geçmişine düzeltme hareketi olarak kaydedilir.
- Fotoğraf değiştirilebilir.
- Kategori değiştirilebilir.

Ürün silmek için:

1. Ürün listesindeki **Sil** düğmesine basın.
2. Onay penceresini kabul edin.
3. Ürün sistemden kaldırılır.

## 5. Kategori Yönetimi

1. Ürünler sekmesindeki kategori ekleme alanına kategori adını yazın.
2. **Kategori ekle** düğmesine basın.
3. Yeni kategori ürün formundaki kategori listesine eklenir.

Notlar:

- Kategori adları benzersiz olmalıdır.
- Kategori seçmeden ürün eklenirse ürün listede **Kategorisiz** görünür.

## 6. Stok Takibi

Stok sekmesinde iki bölüm bulunur:

- Anlık stok: Ürünlerin mevcut stok durumunu gösterir.
- Stok geçmişi: Giriş, çıkış, iade ve düzeltme hareketlerini listeler.

Stok kuralları:

- Ürün eklenirken girilen başlangıç stoğu giriş hareketi olarak kaydedilir.
- Sipariş verildiğinde stok otomatik düşer.
- Sipariş kaynaklı stok düşüşleri çıkış hareketi olarak kaydedilir.
- Admin panelinde stok değişirse düzeltme hareketi oluşur.
- Stok `0` ise sistem sipariş kabul etmez.
- Sipariş adedi mevcut stoktan fazlaysa sipariş oluşturulmaz.
- Aynı anda birden fazla sipariş gelse bile stok negatife düşmez.

## 7. Sipariş Yönetimi

Siparişler sekmesinde sipariş numarası, müşteri e-postası, tutar ve durum bilgisi görünür.

Durum akışı:

1. Hazırlanıyor
2. Kargoda
3. Teslim edildi

Kullanım:

- Sipariş kargoya verildiğinde **Kargoda** düğmesine basın.
- Sipariş müşteriye ulaşınca **Teslim edildi** düğmesine basın.
- Sipariş iptal edilecekse **İptal** düğmesine basın.
- Durum değişiklikleri bildirim olarak kaydedilir.

## 8. Müşteri Yönetimi

Müşteriler sekmesinde kullanıcıları takip edebilirsiniz.

Gösterilen bilgiler:

- Ad soyad
- E-posta
- Rol
- Toplam harcama
- Son giriş tarihi

Bu ekran müşteri geçmişini hızlı incelemek için kullanılır.

## 9. Arama

Sağ üstteki arama kutusu ürün adına ve açıklamasına göre çalışır.

1. Aranacak metni yazın.
2. **Ara** düğmesine basın.
3. Liste filtrelenir.
4. Tüm ürünlere dönmek için arama kutusunu temizleyip tekrar **Ara** düğmesine basın.

## 10. Sık Görülen Uyarılar

- **Bu isimde bir ürün zaten var:** Aynı ürün adıyla ikinci kayıt yapılmaya çalışılmıştır.
- **Ürün adı gerekli:** Ürün adı alanı boş bırakılmıştır.
- **Stok yetersiz:** Sipariş adedi mevcut stoktan fazladır.
- **Stok bitti:** Ürünün stoğu `0` olduğu için sipariş kabul edilmemiştir.
- **Kategoriler alınamadı:** PostgreSQL bağlantısı çalışmıyor olabilir.

PostgreSQL bağlantısını başlatmak için:

```bash
docker compose up -d postgres
```

## 11. Günlük Önerilen İş Akışı

1. Dashboard ekranını kontrol edin.
2. Kritik stok uyarısı olan ürünleri inceleyin.
3. Yeni siparişleri kontrol edin.
4. Hazırlanan siparişleri kargoya alın.
5. Teslim edilen siparişleri tamamlayın.
6. Yeni gelen ürünleri ekleyin.
7. Mevcut ürünlerde stok değişikliği varsa güncelleyin.
8. Gün sonunda müşteri ve sipariş kayıtlarını gözden geçirin.
