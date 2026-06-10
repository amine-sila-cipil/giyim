import prisma from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        ad: true,
        createdAt: true,
        email: true,
        id: true,
        lastLoginAt: true,
        orders: { include: { items: { include: { product: true } } }, orderBy: { orderDate: "desc" } },
        rol: true,
        soyad: true,
      },
    });

    if (!user) return Response.json({ error: "Kullanici bulunamadi" }, { status: 404 });

    return Response.json({
      ...user,
      totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    });
  } catch (error) {
    console.log("USER DETAIL ERROR:", error);
    return Response.json({ error: "Kullanici alinamadi" }, { status: 500 });
  }
}
