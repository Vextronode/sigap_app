import { comparePassword } from "../utils/password.util.js";
import { signToken } from "../utils/jwt.util.js";
import { findByEmail } from "../repositories/user.repository.js";

export class AuthenticationError extends Error { }

export async function login(email: string, password: string) {
  let user;
  try {
    user = await findByEmail(email);
  } catch (dbError) {
    console.error("[AuthService] Database connectivity error during login:", dbError);

    const errStr = dbError instanceof Error ? dbError.message : String(dbError);
    if (errStr.includes("53000") || errStr.includes("quota")) {
      const quotaErr = new Error(
        "Layanan basis data cloud mencapai batas kuota (quota exceeded). Silakan hubungi administrator sistem atau perbarui paket database Neon."
      );
      (quotaErr as Error & { statusCode?: number }).statusCode = 503;
      throw quotaErr;
    }

    const netErr = new Error(
      "Koneksi ke basis data server terputus. Silakan periksa jaringan dan coba beberapa saat lagi."
    );
    (netErr as Error & { statusCode?: number }).statusCode = 503;
    throw netErr;
  }

  if (!user) {
    throw new AuthenticationError("Email atau password salah.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Email atau password salah.");
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.code))
    )
  );

  const token = signToken({
    sub: user.id,
    email: user.email,
    roles,
    permissions,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
    },
  };
}