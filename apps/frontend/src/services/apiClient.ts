import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const trimSlash = (value: string) => value.replace(/\/+$/, "");

const getBaseUrl = () => {
  const rawUrl = 
    import.meta.env.VITE_API_BASE_URL ?? 
    import.meta.env.VITE_API_URL;

  if (!rawUrl) {
    throw new Error("VITE_API_BASE_URL or VITE_API_URL is required.");
  }

  return trimSlash(rawUrl);
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request: menyertakan token JWT pada setiap panggilan jika tersedia
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sigap_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor response: menangani token kedaluwarsa atau penolakan 401 Unauthorized secara global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authState = useAuthStore.getState();
      const hasStoredToken = Boolean(localStorage.getItem("sigap_token"));

      // Determine if error originates from password change endpoint
      const isPasswordChange = error.config?.url?.includes("/auth/change-password");
      // Only logout for token expiration or invalid session, not for password errors
      if (!isPasswordChange && (hasStoredToken || authState.token)) {
        authState.logout();

        // Redirect to login if not already there
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/admin/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const publicPath = (path: string) => `/public${path.startsWith("/") ? "" : "/"}${path}`;
export const protectedPath = (path: string) => `/protected${path.startsWith("/") ? "" : "/"}${path}`;
