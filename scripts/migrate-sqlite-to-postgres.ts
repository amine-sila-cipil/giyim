import path from "path";
import sqlite3 from "sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type OldCategory = {
  ad: string;
  id: number;
};

type OldProduct = {
  aciklama: string | null;
  ad: string | null;
  fiyat: number | null;
  id: number;
  kategori_id: number | null;
  resim: string | null;
  stok: number | null;
};

type OldUser = {
  email: string | null;
  id: number;
  isim: string | null;
  sifre: string | null;
};

function databasePath() {
  return process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), "veritabani.db");
}

function all<T>(db: sqlite3.Database, sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (error, rows) => {
      if (error) reject(error);
      else resolve(rows as T[]);
    });
  });
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { ad: parts[0] || "Kullanici", soyad: "" };
  return { ad: parts.slice(0, -1).join(" "), soyad: parts.at(-1) || "" };
}

function needsHash(password: string) {
  return !(password.startsWith("$2a$") || password.startsWith("$2b$"));
}

async function main() {
  const db = new sqlite3.Database(databasePath());

  try {
    const categories = await all<OldCategory>(db, "SELECT * FROM kategoriler");
    const products = await all<OldProduct>(db, "SELECT * FROM urunler");
    const users = await all<OldUser>(db, "SELECT * FROM kullanicilar");

    const categoryIdMap = new Map<number, number>();

    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { ad: category.ad },
        update: {},
        create: { ad: category.ad },
      });
      categoryIdMap.set(category.id, created.id);
    }

    for (const user of users) {
      if (!user.email || !user.sifre) continue;
      const { ad, soyad } = splitName(user.isim || "Kullanici");

      await prisma.user.upsert({
        where: { email: user.email.toLowerCase() },
        update: {},
        create: {
          ad,
          soyad,
          email: user.email.toLowerCase(),
          passwordHash: needsHash(user.sifre) ? await bcrypt.hash(user.sifre, 12) : user.sifre,
          rol: "musteri",
        },
      });
    }

    for (const product of products) {
      const barkod = `SQLITE-${product.id}`;
      const currentStock = Number(product.stok) || 0;
      const created = await prisma.product.upsert({
        where: { barkod },
        update: {},
        create: {
          aciklama: product.aciklama || "",
          ad: product.ad || `Urun ${product.id}`,
          barkod,
          categoryId: product.kategori_id ? categoryIdMap.get(product.kategori_id) ?? null : null,
          gorsel: product.resim || "",
          satisFiyati: Number(product.fiyat) || 0,
          stok: currentStock,
        },
      });

      if (currentStock > 0) {
        await prisma.stockMovement.create({
          data: {
            productId: created.id,
            quantity: currentStock,
            type: "GIRIS",
            note: "SQLite aktarimi baslangic stogu",
          },
        });
      }
    }

    console.log(
      `Aktarim tamamlandi: ${users.length} kullanici, ${categories.length} kategori, ${products.length} urun.`
    );
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
