/**
 * Auth API service — register, login, get current user
 */
import { apiPost, apiGet, setToken, removeToken } from "./api-client";

export async function register(payload) {
  const data = await apiPost("/auth/register", payload);
  setToken(data.token);
  return data.user;
}

export async function login(payload) {
  const data = await apiPost("/auth/login", payload);
  setToken(data.token);
  return data.user;
}

export async function getMe() {
  return apiGet("/auth/me", true);
}

export function logout() {
  removeToken();
}
