# Railway Deploy Kılavuzu

Bu proje Railway üzerinde Next.js + PostgreSQL olarak çalışacak şekilde hazırlanmıştır.

## 1. Railway Projesi Oluştur

1. [Railway](https://railway.com/) hesabına gir.
2. **New Project** seç.
3. GitHub repo bağlantısını seç veya projeyi GitHub'a gönderip Railway'e bağla.
4. Railway web servisi projeyi otomatik algılar.

## 2. PostgreSQL Ekle

1. Railway projesinde **New Service** seç.
2. **Database** bölümünden **PostgreSQL** ekle.
3. PostgreSQL servisi oluşunca web servisine `DATABASE_URL` değişkenini bağla.

Genelde Railway bunu şu şekilde referanslar:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Railway arayüzünde PostgreSQL servis adın farklı görünüyorsa değişken referansını arayüzden seçerek ekle.

## 3. Web Servisi Değişkenleri

Web servisine şu environment variable değerlerini ekle:

```text
NODE_ENV=production
ADMIN_PANEL_KEY=buraya-guclu-bir-admin-anahtari-yaz
JWT_SECRET=buraya-uzun-rastgele-bir-secret-yaz
```

Fotoğraf yüklemelerinin deploy sonrası kaybolmaması için Railway Volume kullanacaksan:

```text
UPLOAD_DIR=/data/uploads
```

Sonra web servisine `/data` mount path ile bir Railway Volume bağla.

## 4. Build ve Start Ayarları

Projede `railway.json` hazırdır.

Railway şu komutları kullanır:

```bash
npm ci
npm run build
npm run db:migrate
HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

Migration deploy öncesi otomatik çalışır.

## 5. İlk Admin Girişi

Deploy tamamlanınca Railway'in verdiği public domaini aç.

Admin girişi:

```text
/yonetici-giris
```

Admin anahtarı:

```text
ADMIN_PANEL_KEY
```

## 6. SQLite Verilerini Aktarma

Eski SQLite verisini Railway PostgreSQL'e taşımak için yerelde Railway veritabanı bağlantı adresini `.env` içindeki `DATABASE_URL` değerine geçici olarak yazıp çalıştırabilirsin:

```bash
npm run db:migrate:sqlite
```

Bu işlem aynı e-posta, kategori ve ürün kayıtlarını tekrar tekrar çoğaltmaz.

## 7. Kontrol Listesi

- Web servisi deploy oldu mu?
- PostgreSQL servisi çalışıyor mu?
- `DATABASE_URL` web servisine bağlı mı?
- `ADMIN_PANEL_KEY` girildi mi?
- `JWT_SECRET` girildi mi?
- Admin panel açılıyor mu?
- Ürün ekleme çalışıyor mu?
- Sipariş stok kontrolü çalışıyor mu?
