import { create } from "zustand";
import { queryClient } from "../services/queryClient";

export interface DecodedToken {
  sub?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (token: string, user?: AuthUser) => void;
  logout: () => void;
  validateSession: () => boolean;
}

// parsing payload jwt secara aman di browser
export function parseToken(token: string | null): DecodedToken | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// pengecekan apakah token sudah kedaluwarsa berdasarkan field exp jwt
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const decoded = parseToken(token);
  if (!decoded) return true;
  if (!decoded.exp) return false;
  // buffer toleransi 10 detik untuk mencegah race-condition di jaringan
  return Date.now() >= decoded.exp * 1000 - 10_000;
}

// inisialisasi state awal autentikasi dari local storage dengan validasi kedaluwarsa
const rawStoredToken = localStorage.getItem("sigap_token");
const isInitialExpired = isTokenExpired(rawStoredToken);

if (rawStoredToken && isInitialExpired) {
  localStorage.removeItem("sigap_token");
}

const initialToken = !isInitialExpired ? rawStoredToken : null;
const decoded = parseToken(initialToken);
const initialUser: AuthUser | null = decoded
  ? {
      id: decoded.sub,
      email: decoded.email ?? "admin@cibenda.desa.id",
      name: "Administrator Desa",
      roles: decoded.roles ?? ["admin"],
    }
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAdmin: Boolean(initialToken),

  // penanganan login dan penyimpanan sesi
  login: (token, user) => {
    localStorage.setItem("sigap_token", token);
    const parsed = parseToken(token);
    const resolvedUser: AuthUser = user ?? {
      id: parsed?.sub,
      email: parsed?.email ?? "admin@cibenda.desa.id",
      name: "Administrator Desa",
      roles: parsed?.roles ?? ["admin"],
    };

    // Bersihkan cache query lama agar data baru langsung ditarik segar detik itu juga
    queryClient.clear();

    set({
      token,
      user: resolvedUser,
      isAdmin: true,
    });
  },

  // penanganan logout dan pembersihan sesi
  logout: () => {
    localStorage.removeItem("sigap_token");
    queryClient.clear();
    set({
      token: null,
      user: null,
      isAdmin: false,
    });
  },

  // validasi sesi aktif saat ini
  validateSession: () => {
    const currentToken = localStorage.getItem("sigap_token");
    if (isTokenExpired(currentToken)) {
      localStorage.removeItem("sigap_token");
      queryClient.clear();
      set({
        token: null,
        user: null,
        isAdmin: false,
      });
      return false;
    }
    return true;
  },
}));
