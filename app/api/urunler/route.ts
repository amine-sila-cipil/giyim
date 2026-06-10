import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { toLegacyProduct } from "@/lib/mappers";

function otomatikUrunKodu() {
  return `URUN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const categoryId = Number(searchParams.get("kategoriId")) || undefined;
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 100, 1), 100);

    const where: Prisma.ProductWhereInput = {
      ...(categoryId ? { categoryId } : {}),
      ...(query
        ? {
            OR: [
              { ad: { contains: query, mode: "insensitive" } },
              { aciklama: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const rows = products.map(toLegacyProduct);
    const wantsPaged = searchParams.has("page") || searchParams.has("limit");

    return Response.json(
      wantsPaged
        ? { data: rows, meta: { limit, page, total, totalPages: Math.ceil(total / limit) } }
        : rows
    );
  } catch (error) {
    console.log("PRODUCT GET ERROR:", error);
    return Response.json({ error: "Veritabanı hatası" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const barkod = String(body.barkod ?? "").trim() || otomatikUrunKodu();
    const ad = String(body.ad ?? "").trim();

    if (!ad) {
      return Response.json({ error: "Ürün adı gerekli" }, { status: 400 });
    }

    const sameName = await prisma.product.findFirst({
      where: { ad: { equals: ad, mode: "insensitive" } },
      select: { id: true },
    });

    if (sameName) {
      return Response.json({ error: "Bu isimde bir ürün zaten var" }, { status: 409 });
    }

    const stok = Number(body.stok) || 0;
    const product = await prisma.product.create({
      data: {
        aciklama: String(body.aciklama ?? ""),
        ad,
        alisFiyati: Number(body.alisFiyati) || 0,
        barkod,
        categoryId: Number(body.kategoriId) || null,
        gorsel: String(body.resim ?? body.gorsel ?? ""),
        minimumStok: Number(body.minimumStok) || 5,
        satisFiyati: Number(body.satisFiyati ?? body.fiyat) || 0,
        stok,
        stockMovements:
          stok > 0
            ? {
                create: {
                  quantity: stok,
                  type: "GIRIS",
                  note: "Ürün oluşturma başlangıç stoğu",
                },
              }
            : undefined,
      },
      include: { category: true },
    });

    if (product.stok <= product.minimumStok) {
      await prisma.notification.create({
        data: {
          type: "KRITIK_STOK",
          title: "Kritik stok uyarısı",
          message: `${product.ad} ürünü kritik stok seviyesinde.`,
        },
      });
    }

    return Response.json({ message: "Ürün eklendi", product: toLegacyProduct(product) });
  } catch (error) {
    console.log("PRODUCT INSERT ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json(
        { error: "Bu ürün zaten kayıtlı" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Ürün eklenemedi" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return Response.json({ error: "Ürün seçilmedi" }, { status: 400 });

    const onceki = await prisma.product.findUnique({ where: { id } });
    if (!onceki) return Response.json({ error: "Ürün bulunamadı" }, { status: 404 });

    const yeniStok = Number(body.stok ?? onceki.stok);
    const yeniAd = String(body.ad ?? onceki.ad).trim();
    const sameName = await prisma.product.findFirst({
      where: {
        ad: { equals: yeniAd, mode: "insensitive" },
        NOT: { id },
      },
      select: { id: true },
    });

    if (sameName) {
      return Response.json({ error: "Bu isimde bir ürün zaten var" }, { status: 409 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        aciklama: String(body.aciklama ?? onceki.aciklama),
        ad: yeniAd,
        alisFiyati: Number(body.alisFiyati ?? onceki.alisFiyati) || 0,
        barkod: String(body.barkod ?? onceki.barkod).trim() || onceki.barkod,
        categoryId:
          body.kategoriId === "" || body.kategoriId === null
            ? null
            : Number(body.kategoriId ?? onceki.categoryId) || null,
        gorsel: String(body.resim ?? body.gorsel ?? onceki.gorsel),
        minimumStok: Number(body.minimumStok ?? onceki.minimumStok) || 5,
        satisFiyati: Number(body.satisFiyati ?? body.fiyat ?? onceki.satisFiyati) || 0,
        stok: yeniStok,
      },
      include: { category: true },
    });

    const stokFarki = yeniStok - onceki.stok;
    if (stokFarki !== 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: stokFarki,
          type: "DUZELTME",
          note: "Admin ürün düzenleme stok düzeltmesi",
        },
      });
    }

    if (product.stok <= product.minimumStok) {
      await prisma.notification.create({
        data: {
          type: "KRITIK_STOK",
          title: "Kritik stok uyarısı",
          message: `${product.ad} ürünü kritik stok seviyesinde.`,
        },
      });
    }

    return Response.json({ message: "Ürün güncellendi", product: toLegacyProduct(product) });
  } catch (error) {
    console.log("PRODUCT UPDATE ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu ürün zaten kayıtlı" }, { status: 409 });
    }

    return Response.json({ error: "Ürün güncellenemedi" }, { status: 500 });
  }
}
