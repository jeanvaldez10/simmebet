import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "admin-fallback-secret-key-change-in-production"
);

const ADMIN_EMAIL = process.env.NEXT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_ADMIN_PASSWORD;
const COOKIE_NAME = "admin-session";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Validate admin credentials against environment variables
 */
export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const isValid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  return isValid;
}

/**
 * Create a signed JWT token for admin user
 */
export async function createAdminToken(): Promise<string> {
  const payload = {
    id: "admin",
    email: ADMIN_EMAIL,
    name: "Super Admin",
    role: "admin" as const,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode admin JWT token
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Set admin session cookie
 */
export async function setAdminSession() {
  const token = await createAdminToken();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return token;
}

/**
 * Get admin session from cookie
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = await verifyAdminToken(token);

    if (!session) {
      await clearAdminSession();
      return null;
    }

    // Check if token is close to expiring and refresh if needed
    const now = Math.floor(Date.now() / 1000);
    const exp = session.exp;

    if (exp && exp - now < 3600) {
      // Less than 1 hour remaining - refresh token
      try {
        await setAdminSession();
      } catch {
        // Refresh failed, but current session is still valid
      }
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Check if current request has valid admin session
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null && session.role === "admin";
}

/**
 * Middleware to protect admin API routes
 */
export async function requireAdminAuth() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return Response.json(
      { error: "Admin authentication required" },
      { status: 401 }
    );
  }

  return null; // Continue with the request
}
