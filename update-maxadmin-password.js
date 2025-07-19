const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

async function updateMaxAdminPassword() {
  const prisma = new PrismaClient();

  try {
    console.log("Connecting to database...");

    const hashedPassword = await bcryptjs.hash("BLehupali!@2025", 10);
    console.log("Password hashed successfully");

    const result = await prisma.user.update({
      where: {
        email: "max@gigadrive.com",
      },
      data: {
        secrets: {
          update: {
            password: hashedPassword,
          },
        },
      },
      include: { secrets: true },
    });

    console.log("Password updated successfully for user:", result.email);
    console.log("User ID:", result.id);
    console.log("User role:", result.role);
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed");
  }
}

updateMaxAdminPassword();
