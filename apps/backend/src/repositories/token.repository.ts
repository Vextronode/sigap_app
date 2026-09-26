import { prisma } from '../config/prisma.js';

export async function isTokenRevoked(jti: string): Promise<boolean> {
    const revoked = await prisma.revokedToken.findUnique({ where: { jti } });
    return revoked !== null;
}

export async function revokeToken(
    jti: string,
    userId: string,
    expiresAt: Date
): Promise<void> {
    await prisma.revokedToken.create({
        data: {
            jti,
            userId,
            expiresAt,
        },
    })
}