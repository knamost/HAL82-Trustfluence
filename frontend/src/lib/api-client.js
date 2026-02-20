/**
 * Axios-based API client for communicating with the Trustfluence backend.
 *
 * Features:
 *   • Base URL configuration
 *   • Automatic JWT attachment via request interceptor
 *   • 401 handling via response interceptor (clears token, redirects to /auth)
 *   • Typed error class for downstream consumption
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Axios instance ─────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Token helpers ──────────────────────────────────────────────────────────
const TOKEN_KEY = "tf_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Request interceptor — attach JWT ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      data?.error || data?.message || error.message || "Request failed";

    // 401 → clear token and redirect to login
    if (status === 401) {
      removeToken();
      // Only redirect if not already on /auth
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(new ApiError(message, status));
  }
);

// ── API error ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ── Convenience wrappers (keep backward compat with service files) ─────────
export async function apiGet(path, _auth = false) {
  const { data } = await api.get(path);
  return data;
}

export async function apiPost(path, body, _auth = false) {
  const { data } = await api.post(path, body);
  return data;
}

export async function apiPut(path, body, _auth = false) {
  const { data } = await api.put(path, body);
  return data;
}

export async function apiDelete(path, _auth = true) {
  const { data } = await api.delete(path);
  return data;
}
