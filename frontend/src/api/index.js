import axios from "axios";

const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: "/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);

/* ── Token helpers ── */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/* ── Custom error class ── */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Unwrap axios response, throwing ApiError on failure.
 */
function unwrap(promise) {
  return promise
    .then((res) => res.data)
    .catch((err) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Request failed";
      throw new ApiError(msg, err.response?.status, err.response?.data);
    });
}

/* ── Convenience HTTP helpers ── */
export function apiGet(url, params) {
  return unwrap(api.get(url, { params }));
}

export function apiPost(url, data) {
  return unwrap(api.post(url, data));
}

export function apiPut(url, data) {
  return unwrap(api.put(url, data));
}

export function apiDelete(url) {
  return unwrap(api.delete(url));
}

export default api;