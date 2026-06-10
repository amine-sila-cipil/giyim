import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const users = await prisma.user.findMany({
      where: query
        ? {
            OR: [
              { ad: { contains: query, mode: "insensitive" } },
              { soyad: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      select: {
        ad: true,
        createdAt: true,
        email: true,
        id: true,
        lastLoginAt: true,
        orders: { select: { totalAmount: true } },
        rol: true,
        soyad: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return Response.json(
      users.map((user) => ({
        ...user,
        totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      }))
    );
  } catch (error) {
    console.log("USER GET ERROR:", error);
    return Response.json({ error: "Kullanicilar alinamadi" }, { status: 500 });
  }
}
