import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json(notifications);
  } catch (error) {
    console.log("NOTIFICATION GET ERROR:", error);
    return Response.json({ error: "Bildirimler alinamadi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, read } = await req.json();
    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: Boolean(read) },
    });
    return Response.json({ message: "Bildirim guncellendi", notification });
  } catch (error) {
    console.log("NOTIFICATION UPDATE ERROR:", error);
    return Response.json({ error: "Bildirim guncellenemedi" }, { status: 500 });
  }
}
