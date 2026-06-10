import prisma from "@/lib/prisma";

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  try {
    const today = startOfDay();
    const month = startOfMonth();

    const [
      totalProducts,
      totalOrders,
      dailySales,
      monthlySales,
      criticalStock,
      recentOrders,
      unreadNotifications,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderDate: { gte: today }, status: { not: "IPTAL_EDILDI" } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderDate: { gte: month }, status: { not: "IPTAL_EDILDI" } },
      }),
      prisma.product.findMany({
        where: { stok: { lte: prisma.product.fields.minimumStok } },
        include: { category: true },
        orderBy: { stok: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        include: { user: { select: { ad: true, email: true, soyad: true } }, items: true },
        orderBy: { orderDate: "desc" },
        take: 8,
      }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    return Response.json({
      criticalStock,
      dailySales: dailySales._sum.totalAmount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
      recentOrders,
      totalOrders,
      totalProducts,
      unreadNotifications,
    });
  } catch (error) {
    console.log("DASHBOARD ERROR:", error);
    return Response.json({ error: "Dashboard verileri alinamadi" }, { status: 500 });
  }
}
