// @ts-nocheck
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createTestUser } from '../helpers/createTestUser';
// If the integration tests are being skipped (e.g., Docker runtime missing),
// we mark the whole suite as skipped.

// Decide at runtime whether to run or skip this describe block
const describeIf = process.env.SKIP_INTEGRATION ? describe.skip : describe;

// Make sure we use the real Prisma client (unit tests may have mocked it)
jest.unmock('@/lib/prisma');
jest.resetModules();

const prisma = require('@/lib/prisma').default;
const { POST, PATCH } = require('@/app/api/password-reset/route');

// Mock out email-sending utility so integration tests don't make network calls
jest.mock('@/utils/passwordResetEmail', () => ({
  passwordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const TEST_EMAIL = 'integration@example.com';

function mockRequest(body: any) {
  return { json: async () => body } as any;
}

describeIf('Password reset integration (container DB)', () => {
  beforeAll(async () => {
    await createTestUser({ email: TEST_EMAIL, password: 'OldPassword1!' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST sets token and expiry', async () => {
    const res: any = await POST(mockRequest({ email: TEST_EMAIL }));
    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(user?.passwordResetToken).toBeTruthy();
    expect(user?.passwordResetExpires).toBeTruthy();
  });

  it('PATCH updates password and clears token', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email: TEST_EMAIL },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    const res: any = await PATCH(mockRequest({ token: rawToken, password: 'NewPassword1!' }));
    expect(res.status).toBe(200);

    const userAfter = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(userAfter?.passwordResetToken).toBeNull();
    expect(userAfter?.passwordResetExpires).toBeNull();
    expect(await bcrypt.compare('NewPassword1!', userAfter?.password!)).toBe(true);
  });
}); 
