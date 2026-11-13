import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";

/**
 * TK-07: setelah 429, GET publik ke URL yang sama tidak dikirim sampai batas direset.
 * Waktu reset dibaca dari header `RateLimit-Reset` atau `Retry-After` (detik); bila header
 * tidak terbaca (misalnya request lintas origin di development), dipakai 60 detik.
 */
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 60_000;
const RATE_LIMITED_CODE = "ERR_RATE_LIMITED";
const rateLimitedUntil = new Map<string, number>();

const publicGetKey = (config?: InternalAxiosRequestConfig) =>
  config?.method === "get" && config.url?.startsWith("/public/") ? config.url : null;

const resetDelayMs = (error: AxiosError) => {
  const headers = error.response?.headers;
  const seconds = Number(headers?.["ratelimit-reset"] ?? headers?.["retry-after"]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_RATE_LIMIT_BACKOFF_MS;
};

export const isRateLimitError = (error: unknown) =>
  axios.isAxiosError(error) &&
  (error.response?.status === 429 || error.code === RATE_LIMITED_CODE);

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
  const key = publicGetKey(config);
  if (key && Date.now() < (rateLimitedUntil.get(key) ?? 0)) {
    throw new AxiosError("Menunggu batas permintaan direset.", RATE_LIMITED_CODE, config);
  }

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
    const rateLimitKey = error.response?.status === 429 ? publicGetKey(error.config) : null;
    if (rateLimitKey) {
      rateLimitedUntil.set(rateLimitKey, Date.now() + resetDelayMs(error));
    }

    if (error.response && error.response.status === 401) {
      const authState = useAuthStore.getState();
      const hasStoredToken = Boolean(localStorage.getItem("sigap_token"));

      const isPasswordChange = error.config?.url?.includes("/auth/change-password");
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      // Hanya logout jika error 401 berasal dari request yang membutuhkan autentikasi
      const isProtectedRequest = 
        error.config?.url?.includes("/protected/") || 
        error.config?.url?.includes("/auth/me");

      if (!isPasswordChange && !isLoginRequest && isProtectedRequest && (hasStoredToken || authState.token)) {
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
