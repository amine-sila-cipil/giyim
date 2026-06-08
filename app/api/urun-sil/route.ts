import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM urunler WHERE id = ?",
        [id],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });

    return Response.json({
      message: "Ürün silindi",
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      { error: "Silinemedi" },
      { status: 500 }
    );
  }
}
