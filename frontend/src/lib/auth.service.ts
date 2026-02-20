/**
 * Auth API service — register, login, get current user
 */
import { apiPost, apiGet, setToken, removeToken } from "./api-client";

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: "creator" | "brand" | "admin";
  createdAt?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export async function register(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "creator" | "brand";
}): Promise<User> {
  const data = await apiPost<AuthResponse>("/auth/register", payload);
  setToken(data.token);
  return data.user;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<User> {
  const data = await apiPost<AuthResponse>("/auth/login", payload);
  setToken(data.token);
  return data.user;
}

export async function getMe(): Promise<User> {
  return apiGet<User>("/auth/me", true);
}

export function logout(): void {
  removeToken();
}
