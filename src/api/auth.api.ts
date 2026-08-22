import { apiClient } from "./client";
import { AuthResponse, User } from "../types";

export const AuthAPI = {
  async login(credentials: { email?: string; password?: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return res.data;
  },

  async register(data: { name?: string; email?: string; password?: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await apiClient.get<{ success: boolean; user: User }>("/auth/me");
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
  },
};
