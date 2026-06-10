import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const statusFlow = ["HAZIRLANIYOR", "KARGODA", "TESLIM_EDILDI"];

function normalizeOrderItems(items: any[]) {
  const totals = new Map<number, number>();

  for (const item of items) {
    const productId = Number(item.productId ?? item.id);
    const adet = Math.max(Number(item.adet) || 1, 1);
    if (!productId) continue;
    totals.set(productId, (totals.get(productId) || 0) + adet);
  }

  return Array.from(totals, ([productId, adet]) => ({ productId, adet }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 25, 1), 100);

    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { ad: true, email: true, id: true, soyad: true } },
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return Response.json({ data: orders, meta: { limit, page, total } });
  } catch (error) {
    console.log("ORDER GET ERROR:", error);
    return Response.json({ error: "Siparisler alinamadi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? Number(body.userId);
    const items = Array.isArray(body.items) ? body.items : [];

    if (!userId || items.length === 0) {
      return Response.json({ error: "Kullanici ve urunler gerekli" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const normalizedItems = normalizeOrderItems(items);
      const productIds = normalizedItems.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((product) => [product.id, product]));

      let totalAmount = 0;
      const orderItems = normalizedItems.map((item) => {
        const productId = item.productId;
        const product = productMap.get(productId);
        const adet = item.adet;
        if (!product) throw new Error("Urun bulunamadi");
        if (product.stok <= 0) throw new Error(`${product.ad} icin stok bitti`);
        if (product.stok < adet) throw new Error(`${product.ad} icin stok yetersiz`);
        totalAmount += product.satisFiyati * adet;
        return { productId, adet, fiyat: product.satisFiyati };
      });

      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: { create: orderItems },
        },
        include: { items: true, user: true },
      });

      for (const item of orderItems) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, stok: { gte: item.adet } },
          data: { stok: { decrement: item.adet } },
        });

        if (stockUpdate.count !== 1) {
          const product = productMap.get(item.productId);
          throw new Error(`${product?.ad || "Urun"} icin stok yetersiz`);
        }

        const updated = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.adet,
            type: "CIKIS",
            note: `Siparis #${createdOrder.id}`,
          },
        });
        if (updated.stok <= updated.minimumStok) {
          await tx.notification.create({
            data: {
              type: "KRITIK_STOK",
              title: "Kritik stok uyarisi",
              message: `${updated.ad} urunu kritik stok seviyesinde.`,
            },
          });
        }
      }

      await tx.notification.create({
        data: {
          type: "YENI_SIPARIS",
          title: "Yeni siparis",
          message: `#${createdOrder.id} numarali yeni siparis olustu.`,
        },
      });

      return createdOrder;
    });

    return Response.json({ message: "Sipariş oluşturuldu", order });
  } catch (error) {
    console.log("ORDER CREATE ERROR:", error);
    const message = error instanceof Error ? error.message : "Sipariş oluşturulamadı";
    const isStockError = message.includes("stok");

    return Response.json(
      { error: message },
      { status: isStockError ? 409 : 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = Number(body.id);
    const status = String(body.status || "");
    if (!id || !status) return Response.json({ error: "Siparis ve durum gerekli" }, { status: 400 });

    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return Response.json({ error: "Siparis bulunamadi" }, { status: 404 });

    const currentIndex = statusFlow.indexOf(current.status);
    const nextIndex = statusFlow.indexOf(status);
    if (status !== "IPTAL_EDILDI" && nextIndex !== currentIndex + 1 && status !== current.status) {
      return Response.json({ error: "Gecersiz siparis durumu akisi" }, { status: 400 });
    }

    const order = await prisma.order.update({ where: { id }, data: { status: status as any } });
    await prisma.notification.create({
      data: {
        type: "SIPARIS_DURUM",
        title: "Siparis durumu guncellendi",
        message: `#${id} numarali siparis durumu ${status} oldu.`,
        userId: order.userId,
      },
    });

    return Response.json({ message: "Siparis durumu guncellendi", order });
  } catch (error) {
    console.log("ORDER UPDATE ERROR:", error);
    return Response.json({ error: "Siparis guncellenemedi" }, { status: 500 });
  }
}
