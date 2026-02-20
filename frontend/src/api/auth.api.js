import { apiPost, apiGet, setToken, removeToken } from "./index";

/**
 * POST /auth/login
 * Returns user object + token. Stores token in localStorage.
 */
export async function login({ email, password }) {
  const data = await apiPost("/auth/login", { email, password });
  if (data.token) setToken(data.token);
  return data.user || data;
}

/**
 * POST /auth/register
 * Returns user object + token. Stores token in localStorage.
 */
export async function register({ email, password, role, first_name, last_name }) {
  const data = await apiPost("/auth/register", {
    email,
    password,
    role,
    first_name,
    last_name,
  });
  if (data.token) setToken(data.token);
  return data.user || data;
}

/**
 * GET /auth/me
 * Returns the currently authenticated user.
 */
export async function getMe() {
  return apiGet("/auth/me");
}

/**
 * Logout — just clear the token from localStorage.
 */
export function logout() {
  removeToken();
}