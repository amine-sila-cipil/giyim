import { readFile } from "fs/promises";
import path from "path";

function uploadKlasoru() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

function contentType(dosyaAdi: string) {
  const uzanti = path.extname(dosyaAdi).toLowerCase();

  if (uzanti === ".jpg" || uzanti === ".jpeg") return "image/jpeg";
  if (uzanti === ".png") return "image/png";
  if (uzanti === ".webp") return "image/webp";
  if (uzanti === ".gif") return "image/gif";

  return "application/octet-stream";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const guvenliAd = path.basename(filename);
    const filePath = path.join(uploadKlasoru(), guvenliAd);
    const dosya = await readFile(filePath);

    return new Response(dosya, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType(guvenliAd),
      },
    });
  } catch {
    return new Response("Dosya bulunamadı", { status: 404 });
  }
}
