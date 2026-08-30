import axios from "axios";

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

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sigap_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const publicPath = (path: string) => `/public${path.startsWith("/") ? "" : "/"}${path}`;
export const protectedPath = (path: string) => `/protected${path.startsWith("/") ? "" : "/"}${path}`;
