import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const productId = Number(id);

    if (!productId) {
      return Response.json({ error: "Urun secilmedi" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return Response.json({ message: "Urun silindi" });
  } catch (error) {
    console.log("PRODUCT DELETE ERROR:", error);
    return Response.json({ error: "Silinemedi" }, { status: 500 });
  }
}
