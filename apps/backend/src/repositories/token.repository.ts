import { prisma } from "../config/prisma.js";

/**
 * Memeriksa apakah jti token sudah tercatat dalam blocklist sesi revoked.
 * Mengembalikan true jika token tidak memiliki jti (dianggap tidak valid) atau sudah di-revoke.
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  if (!jti) return true;
  const revoked = await prisma.revokedToken.findUnique({ where: { jti } });
  return revoked !== null;
}

/**
 * Mencatat token ke dalam tabel blocklist revoked_tokens.
 * Menggunakan upsert agar bersifat idempoten jika terjadi retry request / double-click logout.
 */
export async function revokeToken(
  jti: string,
  userId: string,
  expiresAt: Date
): Promise<void> {
  await prisma.revokedToken.upsert({
    where: { jti },
    update: {},
    create: {
      jti,
      userId,
      expiresAt,
    },
  });
}