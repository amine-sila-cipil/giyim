import { mkdir, writeFile } from "fs/promises";

function uploadKlasoru() {
  return process.env.UPLOAD_DIR || "uploads";
}

function uploadDosyaYolu(dosyaAdi: string) {
  return `${uploadKlasoru().replace(/[\\/]$/, "")}/${dosyaAdi}`;
}

function dosyaAdiniTemizle(dosyaAdi: string) {
  return dosyaAdi.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Dosya yok" },
        { status: 400 }
      );
    }

    const klasor = uploadKlasoru();
    await mkdir(klasor, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = Date.now() + "-" + dosyaAdiniTemizle(file.name);
    const filePath = uploadDosyaYolu(fileName);

    await writeFile(filePath, buffer);

    return Response.json({
      path: "/api/uploads/" + fileName,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      { error: "Yükleme başarısız" },
      { status: 500 }
    );
  }
}
