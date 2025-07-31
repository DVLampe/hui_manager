import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    transactionOptions: {
      maxWait: 50000, // default: 2000
      timeout: 60000, // default: 5000
    },
  });
};

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
