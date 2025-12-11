import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

interface CreateTestUserOptions {
  email?: string;
  password?: string;
  overrides?: Partial<Parameters<typeof prisma.user.create>[0]['data']>;
}

export async function createTestUser({
  email = 'test@example.com',
  password = 'Password1!',
  overrides = {},
}: CreateTestUserOptions = {}) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: hashed,
      ...overrides,
    },
  });
} 
