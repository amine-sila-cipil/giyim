import { StockMovementType } from "@prisma/client";
import prisma from "@/lib/prisma";

const hareketTipleri = new Set<StockMovementType>([
  "GIRIS",
  "CIKIS",
  "IADE",
  "DUZELTME",
]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = Number(searchParams.get("productId")) || undefined;
    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId } : {},
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json(movements);
  } catch (error) {
    console.log("STOCK GET ERROR:", error);
    return Response.json({ error: "Stok hareketleri alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Math.trunc(Number(body.quantity));
    const type = String(body.type || "DUZELTME") as StockMovementType;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return Response.json({ error: "Ürün ve pozitif miktar gerekli" }, { status: 400 });
    }

    if (!hareketTipleri.has(type)) {
      return Response.json({ error: "Geçersiz stok hareketi" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { ad: true, minimumStok: true, stok: true },
    });

    if (!product) {
      return Response.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const signedQuantity = type === "CIKIS" ? -Math.abs(quantity) : Math.abs(quantity);
    const nextStock = product.stok + signedQuantity;

    if (nextStock < 0) {
      return Response.json({ error: "Stok eksiye düşemez" }, { status: 400 });
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          quantity: signedQuantity,
          type,
          note: String(body.note ?? ""),
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stok: { increment: signedQuantity } },
      }),
    ]);

    if (nextStock <= product.minimumStok) {
      await prisma.notification.create({
        data: {
          type: "KRITIK_STOK",
          title: "Kritik stok uyarısı",
          message: `${product.ad} ürünü kritik stok seviyesinde.`,
        },
      });
    }

    return Response.json({ message: "Stok hareketi kaydedildi", movement });
  } catch (error) {
    console.log("STOCK CREATE ERROR:", error);
    return Response.json({ error: "Stok hareketi kaydedilemedi" }, { status: 500 });
  }
}
