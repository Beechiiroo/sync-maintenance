/**
 * Django API HTTP client with JWT auth + automatic refresh.
 * Base URL is configured via VITE_DJANGO_API_URL (defaults to http://localhost:8000/api).
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  (import.meta.env.VITE_DJANGO_API_URL as string | undefined) ??
  "http://localhost:8000/api";

const ACCESS_KEY = "django_access_token";
const REFRESH_KEY = "django_refresh_token";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Attach access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("No refresh token");
  const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
  tokenStorage.set(data.access, data.refresh ?? refresh);
  return data.access;
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && tokenStorage.getRefresh()) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (e) {
        refreshPromise = null;
        tokenStorage.clear();
        // Redirect to login on hard failure
        if (typeof window !== "undefined") window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export const API_BASE_URL = BASE_URL;
