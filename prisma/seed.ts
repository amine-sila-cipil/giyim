import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@inventtisi.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { rol: "admin" },
    create: {
      ad: "Sistem",
      soyad: "Yoneticisi",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      rol: "admin",
    },
  });

  const kategoriler = ["Elbise", "Tunik", "Yeni Sezon"];
  for (const ad of kategoriler) {
    await prisma.category.upsert({
      where: { ad },
      update: {},
      create: { ad },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
