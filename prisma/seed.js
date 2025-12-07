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

  // Upsert Subscription Plans
  await prisma.subscriptionPlan.upsert({
    where: { name: 'Trial' },
    update: {},
    create: {
      name: 'Trial',
      type: 'TRIAL',
      price: 0,
      duration: 14,
      huiLimit: 0,
      features: {},
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      type: 'BASIC',
      price: 0,
      duration: 0,
      huiLimit: 10,
      features: {},
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium 1 Month' },
    update: {},
    create: {
      name: 'Premium 1 Month',
      type: 'PREMIUM',
      price: 0,
      duration: 30,
      huiLimit: 0,
      features: {},
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium 6 Months' },
    update: {},
    create: {
      name: 'Premium 6 Months',
      type: 'PREMIUM',
      price: 0,
      duration: 180,
      huiLimit: 0,
      features: {},
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium 12 Months' },
    update: {},
    create: {
      name: 'Premium 12 Months',
      type: 'PREMIUM',
      price: 0,
      duration: 365,
      huiLimit: 0,
      features: {},
    },
  });

  const premiumForever = await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium Forever' },
    update: {},
    create: {
      name: 'Premium Forever',
      type: 'PREMIUM',
      price: 0,
      duration: 0,
      huiLimit: 0,
      features: {},
    },
  });

  // Assign Premium Forever to all existing users
  const allUsers = await prisma.user.findMany();
  for (const user of allUsers) {
    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        planId: premiumForever.id,
        startDate: new Date(),
        endDate: null,
        isActive: true,
      },
    });
  }

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
