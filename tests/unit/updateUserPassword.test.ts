// @ts-nocheck
import { updateUserPassword } from '@/components/used-components/auth/actions/user-password';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

const prisma = require('@/lib/prisma').default;

describe('updateUserPassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns error if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await updateUserPassword({ email: 'x@x.com', password: 'New123!' });
    expect(res.status).toBe(false);
    expect(res.message).toBe('User not found');
  });

  it('returns error if same password', async () => {
    const hash = await bcrypt.hash('Same123!', 10);
    prisma.user.findUnique.mockResolvedValue({ password: hash });
    const res = await updateUserPassword({ email: 'x@x.com', password: 'Same123!' });
    expect(res.status).toBe(false);
    expect(res.message).toMatch(/cannot be same/);
  });

  it('updates password when valid', async () => {
    const oldHash = await bcrypt.hash('OldPassword1!', 10);
    prisma.user.findUnique.mockResolvedValue({ password: oldHash, email: 'x@x.com' });
    prisma.user.update.mockResolvedValue({});
    const res = await updateUserPassword({ email: 'x@x.com', password: 'NewPassword1!' });
    expect(res.status).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
