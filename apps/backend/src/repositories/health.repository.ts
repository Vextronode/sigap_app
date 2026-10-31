import { prisma } from "../config/prisma.js";

/**
 * Query paling ringan untuk memastikan DB bisa menjawab (dipakai readiness check).
 */
export async function pingDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
