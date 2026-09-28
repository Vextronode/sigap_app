import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk menegakkan otorisasi berbasis Permission (SEC-1 / RBAC)
 */
export function requirePermission(permissionCode: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan.",
        errors: ["Sesi pengguna tidak ditemukan."],
      });
    }

    const hasPermission = Array.isArray(user.permissions) && user.permissions.includes(permissionCode);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak.",
        errors: [`Akun Anda tidak memiliki hak akses '${permissionCode}' untuk fitur ini.`],
      });
    }

    next();
  };
}

/**
 * Middleware untuk menegakkan otorisasi berbasis Role tertentu
 */
export function requireRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan.",
        errors: ["Sesi pengguna tidak ditemukan."],
      });
    }

    const hasRole = Array.isArray(user.roles) && user.roles.includes(roleName);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak.",
        errors: [`Akses ini hanya diperbolehkan untuk pengguna dengan peran '${roleName}'.`],
      });
    }

    next();
  };
}
