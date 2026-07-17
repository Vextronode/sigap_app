import axios from "axios";

const trimSlash = (value: string) => value.replace(/\/+$/, "");

const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
  const apiVersion = import.meta.env.VITE_API_VERSION ?? "v1";

  if (!rawUrl) {
    throw new Error("VITE_API_BASE_URL or VITE_API_URL is required.");
  }

  const baseUrl = trimSlash(rawUrl);
  return baseUrl.endsWith(`/${apiVersion}`) ? baseUrl : `${baseUrl}/${apiVersion}`;
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
