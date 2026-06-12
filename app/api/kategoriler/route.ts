import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(): Promise<Response> {
  try {
    const rows = await prisma.category.findMany({ orderBy: { ad: "asc" } });
    return Response.json(rows);
  } catch (error) {
    console.log("CATEGORY GET ERROR:", error);
    return Response.json({ error: "Kategoriler alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { ad } = await req.json();
    const kategoriAdi = String(ad ?? "").trim();

    if (!kategoriAdi) {
      return Response.json({ error: "Kategori adı gerekli" }, { status: 400 });
    }

    await prisma.category.create({ data: { ad: kategoriAdi } });
    return Response.json({ message: "Kategori eklendi" });
  } catch (error) {
    console.log("CATEGORY INSERT ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu kategori zaten var" }, { status: 409 });
    }

    return Response.json({ error: "Kategori eklenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { id } = await req.json();
    const kategoriId = Number(id);

    if (!kategoriId) {
      return Response.json({ error: "Kategori seçilmedi" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { categoryId: kategoriId },
        data: { categoryId: null },
      }),
      prisma.category.delete({ where: { id: kategoriId } }),
    ]);

    return Response.json({ message: "Kategori silindi" });
  } catch (error) {
    console.log("CATEGORY DELETE ERROR:", error);
    return Response.json({ error: "Kategori silinemedi" }, { status: 500 });
  }
}
