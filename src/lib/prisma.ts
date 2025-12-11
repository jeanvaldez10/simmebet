import { PrismaClient } from '@/generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Get the runtime database URL. During tests, a custom URL may be injected on the global object.
type GlobalWithTestDb = typeof global & { __TEST_DB_URL__?: string };
const runtimeDbUrl =
  process.env.DATABASE_URL || (global as GlobalWithTestDb).__TEST_DB_URL__;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(runtimeDbUrl
      ? {
          datasources: {
            db: {
              url: runtimeDbUrl,
            },
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 
