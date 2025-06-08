import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Or your preferred password hashing library

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      // In a real application, hash the password before saving
      password: await bcrypt.hash('password123', 10), // Hashing the password
      name: 'Admin User',
      role: 'ADMIN',
      phone: '1234567890',
      isActive: true,
    },
  });
  console.log(`Created admin user: ${adminUser.name} with id: ${adminUser.id}`);

  // Create Manager User
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: await bcrypt.hash('password123', 10), // Hashing the password
      name: 'Manager User',
      role: 'MANAGER',
      phone: '0987654321',
      isActive: true,
    },
  });
  console.log(`Created manager user: ${managerUser.name} with id: ${managerUser.id}`);

  // Create Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10), // Hashing the password
      name: 'Test User One',
      role: 'USER',
      phone: '1112223333',
      isActive: true,
    },
  });
  console.log(`Created user: ${user1.name} with id: ${user1.id}`);

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', 10), // Hashing the password
      name: 'Test User Two',
      role: 'USER',
      phone: '4445556666',
      isActive: false, // Example of an inactive user
    },
  });
  console.log(`Created user: ${user2.name} with id: ${user2.id}`);
  
  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      password: await bcrypt.hash('password123', 10), // Hashing the password
      name: 'Test User Three',
      role: 'USER',
      phone: '7778889999',
      isActive: true,
    },
  });
  console.log(`Created user: ${user3.name} with id: ${user3.id}`);

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

// To run this seed script, you would typically add it to your package.json:
// "prisma": {
//   "seed": "node prisma/seed.js"
// }
// And then run: npx prisma db seed
// Ensure you have bcrypt installed (npm install bcrypt or yarn add bcrypt).
