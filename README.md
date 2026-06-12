# Inventtisi Giyim

Next.js 16, TypeScript, PostgreSQL, Prisma ve Tailwind tabanlı stok ve sipariş yönetimi projesi.

## Geliştirme

```bash
npm install
npm run db:generate
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.
Bu projede `npm run dev` ve `npm run start` komutları `0.0.0.0` üzerinden çalışır; aynı Wi-Fi ağındaki başka cihazlar siteyi bilgisayarın yerel IP adresiyle açabilir.

Örnek:

```text
http://172.20.10.2:3000
```

Port doluysa Next.js bir sonraki portu kullanabilir. Bu durumda terminalde görünen Network adresini açın.

## PostgreSQL / Prisma Kurulumu

1. Yerel PostgreSQL'i Docker ile başlatın:

```bash
docker compose up -d postgres
```

2. `.env` içindeki `DATABASE_URL` değerini PostgreSQL veritabanı adresinizle değiştirin. Yereldeki varsayılan değer şudur:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventtisi?schema=public"
```

3. Tabloları oluşturun:

```bash
npm run db:migrate
```

4. Varsayılan admin ve kategorileri yükleyin:

```bash
npm run db:seed
```

5. Eski SQLite verilerini PostgreSQL'e aktarmak için, `veritabani.db` dosyası proje kökündeyken:

```bash
npm run db:migrate:sqlite
```

Aktarım betiği tekrar çalıştırıldığında aynı e-posta, kategori ve ürün kayıtlarını çoğaltmaz.
Uygulama çalışma zamanında SQLite kullanmaz; `sqlite3` yalnızca tek seferlik aktarım betiği için geliştirme bağımlılığıdır.

## Üretim

```bash
npm run build
npm run start
```

## Vercel Deploy

Proje Vercel için hazırlanmıştır. GitHub reposunu Vercel'e bağladıktan sonra aşağıdaki ortam değişkenlerini ekleyin:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="güçlü-bir-secret"
ADMIN_PANEL_KEY="güçlü-bir-admin-anahtarı"
NODE_ENV="production"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

Fotoğraf yükleme Vercel'de `BLOB_READ_WRITE_TOKEN` varsa Vercel Blob'a yapılır. Bu değer yoksa yükleme yerel `uploads` klasörüne yapılır; Vercel'de kalıcı fotoğraf için Blob token eklenmelidir.

Vercel build komutu `vercel.json` içinde tanımlıdır:

```bash
npm run vercel-build
```

Bu komut sırasıyla Prisma client üretir, migration dosyalarını PostgreSQL'e uygular ve Next.js build alır.
