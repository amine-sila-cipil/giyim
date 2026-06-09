import { mkdirSync } from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "veritabani.db");
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS kategoriler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS urunler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad TEXT,
      aciklama TEXT,
      fiyat INTEGER,
      stok INTEGER,
      resim TEXT,
      kategori_id INTEGER
    )
  `);

  db.run("ALTER TABLE urunler ADD COLUMN kategori_id INTEGER", () => {
    // Eski veritabanlarında kolon varsa SQLite hata verir; görmezden geliyoruz.
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS kullanicilar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isim TEXT,
      email TEXT UNIQUE,
      sifre TEXT
    )
  `);
});

export default db;
