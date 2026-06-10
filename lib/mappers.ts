import type { Category, Product } from "@prisma/client";

export type ProductWithCategory = Product & {
  category: Category | null;
};

export function toLegacyProduct(product: ProductWithCategory) {
  return {
    aciklama: product.aciklama,
    ad: product.ad,
    alisFiyati: product.alisFiyati,
    barkod: product.barkod,
    createdAt: product.createdAt,
    fiyat: product.satisFiyati,
    guncellenmeTarihi: product.updatedAt,
    id: product.id,
    kategori: product.category?.ad ?? null,
    kategori_ad: product.category?.ad ?? null,
    kategori_id: product.categoryId,
    minimumStok: product.minimumStok,
    resim: product.gorsel,
    satisFiyati: product.satisFiyati,
    stok: product.stok,
    updatedAt: product.updatedAt,
  };
}
