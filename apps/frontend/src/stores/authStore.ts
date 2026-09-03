import { create } from "zustand";

interface DecodedToken {
  sub?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthUser {
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
}

// parsing payload jwt secara aman di browser
function parseToken(token: string | null): DecodedToken | null {
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

// inisialisasi state awal autentikasi dari local storage
const initialToken = localStorage.getItem("sigap_token");
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
    set({
      token,
      user: resolvedUser,
      isAdmin: true,
    });
  },

  // penanganan logout dan pembersihan sesi
  logout: () => {
    localStorage.removeItem("sigap_token");
    set({
      token: null,
      user: null,
      isAdmin: false,
    });
  },
}));
