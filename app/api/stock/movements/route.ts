import prisma from "@/lib/prisma";

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
    return Response.json({ error: "Stok hareketleri alinamadi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);
    const type = String(body.type || "DUZELTME") as any;

    if (!productId || !quantity) {
      return Response.json({ error: "Urun ve miktar gerekli" }, { status: 400 });
    }

    const signedQuantity = type === "CIKIS" ? -Math.abs(quantity) : Math.abs(quantity);
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

    return Response.json({ message: "Stok hareketi kaydedildi", movement });
  } catch (error) {
    console.log("STOCK CREATE ERROR:", error);
    return Response.json({ error: "Stok hareketi kaydedilemedi" }, { status: 500 });
  }
}
