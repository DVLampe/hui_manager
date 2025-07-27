import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Or your preferred password hashing library

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Upsert Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      phone: '1234567890',
      isActive: true,
    },
  });
  console.log(`Upserted admin user: ${adminUser.name} with id: ${adminUser.id}`);

  // Upsert Regular Users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User One',
      role: 'USER',
      phone: '1112223333',
      isActive: true,
    },
  });
  console.log(`Upserted user: ${user1.name} with id: ${user1.id}`);

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User Two',
      role: 'USER',
      phone: '4445556666',
      isActive: false,
    },
  });
  console.log(`Upserted user: ${user2.name} with id: ${user2.id}`);
  
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      email: 'user3@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User Three',
      role: 'USER',
      phone: '7778889999',
      isActive: true,
    },
  });
  console.log(`Upserted user: ${user3.name} with id: ${user3.id}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
