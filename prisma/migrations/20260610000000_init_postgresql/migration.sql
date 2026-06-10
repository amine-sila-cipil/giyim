CREATE TYPE "UserRole" AS ENUM ('admin', 'personel', 'musteri');
CREATE TYPE "OrderStatus" AS ENUM ('HAZIRLANIYOR', 'KARGODA', 'TESLIM_EDILDI', 'IPTAL_EDILDI');
CREATE TYPE "StockMovementType" AS ENUM ('GIRIS', 'CIKIS', 'IADE', 'DUZELTME');
CREATE TYPE "NotificationType" AS ENUM ('KRITIK_STOK', 'YENI_SIPARIS', 'SIPARIS_DURUM');

CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "ad" TEXT NOT NULL,
  "soyad" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "rol" "UserRole" NOT NULL DEFAULT 'musteri',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" TIMESTAMP(3)
);

CREATE TABLE "kategoriler" (
  "id" SERIAL PRIMARY KEY,
  "ad" TEXT NOT NULL UNIQUE
);

CREATE TABLE "urunler" (
  "id" SERIAL PRIMARY KEY,
  "barkod" TEXT NOT NULL UNIQUE,
  "ad" TEXT NOT NULL,
  "aciklama" TEXT NOT NULL DEFAULT '',
  "alisFiyati" INTEGER NOT NULL DEFAULT 0,
  "satisFiyati" INTEGER NOT NULL DEFAULT 0,
  "stok" INTEGER NOT NULL DEFAULT 0,
  "minimumStok" INTEGER NOT NULL DEFAULT 5,
  "gorsel" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "categoryId" INTEGER,
  CONSTRAINT "urunler_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "kategoriler"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Order" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalAmount" INTEGER NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'HAZIRLANIYOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OrderItem" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "adet" INTEGER NOT NULL,
  "fiyat" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "urunler"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "StockMovement" (
  "id" SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "urunler"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Notification" (
  "id" SERIAL PRIMARY KEY,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "userId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "urunler_ad_barkod_key" ON "urunler"("ad", "barkod");
CREATE INDEX "User_rol_idx" ON "User"("rol");
CREATE INDEX "urunler_ad_idx" ON "urunler"("ad");
CREATE INDEX "urunler_categoryId_idx" ON "urunler"("categoryId");
CREATE INDEX "urunler_stok_idx" ON "urunler"("stok");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
