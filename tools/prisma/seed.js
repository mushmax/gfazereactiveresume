const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const existingUser = await prisma.user.findUnique({
    where: { email: "max@gigadrive.com" },
  });

  if (existingUser) {
    console.log("👤 maxadmin user already exists, skipping creation");
    return;
  }

  const password = process.env.maxadmin || "DefaultPassword123";
  const hashedPassword = await bcryptjs.hash(password, 10);

  const maxadminUser = await prisma.user.create({
    data: {
      name: "Max Admin",
      email: "max@gigadrive.com",
      username: "maxadmin",
      locale: "en-US",
      provider: "email",
      role: "SUPER_ADMIN",
      emailVerified: true,
      secrets: {
        create: {
          password: hashedPassword,
          lastSignedIn: new Date(),
        },
      },
    },
    include: {
      secrets: true,
    },
  });

  console.log("✅ Created maxadmin user:", {
    id: maxadminUser.id,
    email: maxadminUser.email,
    username: maxadminUser.username,
    role: maxadminUser.role,
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
