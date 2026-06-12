import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "1234";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      rol: "admin",
    },
    create: {
      ad: "Sistem",
      soyad: "Yöneticisi",
      email: adminEmail,
      passwordHash: adminPasswordHash,
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
