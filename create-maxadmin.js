const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'max@gigadrive.com' },
    update: { 
      role: 'ADMIN',
      enabled: true
    },
    create: {
      name: 'maxadmin',
      email: 'max@gigadrive.com',
      username: 'maxadmin',
      locale: 'en-US',
      provider: 'email',
      role: 'ADMIN',
      emailVerified: true,
      secrets: {
        create: {
          password: hashedPassword,
          lastSignedIn: new Date(),
        },
      },
    },
    include: { secrets: true },
  });
  
  console.log('Maxadmin account created/updated:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
