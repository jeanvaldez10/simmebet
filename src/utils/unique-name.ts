import prisma from "@/lib/prisma";

export async function generateUniqueUsername(): Promise<string> {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const generate = () => {
    const length = Math.floor(Math.random() * 2) + 7;
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  let username: string;
  let exists = true;

  do {
    username = generate();
    const existing = await prisma.user.findUnique({ where: { username } });
    exists = !!existing;
  } while (exists);

  return username;
}
