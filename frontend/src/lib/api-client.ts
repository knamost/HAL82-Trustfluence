/**
 * Base API client for communicating with the Trustfluence backend.
 * All service modules use this shared fetch wrapper.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Get stored JWT token */
export function getToken(): string | null {
  return localStorage.getItem("tf_token");
}

/** Store JWT token */
export function setToken(token: string): void {
  localStorage.setItem("tf_token", token);
}

/** Remove JWT token */
export function removeToken(): void {
  localStorage.removeItem("tf_token");
}

/** Build headers, optionally including auth */
function buildHeaders(auth: boolean): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/** Generic API error */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Parse the response and throw on error */
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

/** Generic GET */
export async function apiGet<T>(path: string, auth = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(auth),
  });
  return handleResponse<T>(res);
}

/** Generic POST */
export async function apiPost<T>(path: string, body: unknown, auth = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(auth),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** Generic PUT */
export async function apiPut<T>(path: string, body: unknown, auth = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(auth),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** Generic DELETE */
export async function apiDelete<T>(path: string, auth = true): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(auth),
  });
  return handleResponse<T>(res);
}
