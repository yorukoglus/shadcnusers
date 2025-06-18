import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { role: "admin" },
    create: {
      name: "Test Admin",
      email: "test@example.com",
      password,
      role: "admin",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
