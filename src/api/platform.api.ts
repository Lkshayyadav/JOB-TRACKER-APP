import { apiClient } from "./client";
import { Platform } from "../types";

export const PlatformAPI = {
  async getPlatforms(): Promise<Platform[]> {
    const res = await apiClient.get<Platform[]>("/platforms");
    return res.data;
  },

  async getPlatformStats(): Promise<Platform[]> {
    const res = await apiClient.get<Platform[]>("/platforms/stats");
    return res.data;
  },

  async createPlatform(data: Partial<Platform>): Promise<Platform> {
    const res = await apiClient.post<Platform>("/platforms", data);
    return res.data;
  },

  async updatePlatform(id: string, data: Partial<Platform>): Promise<Platform> {
    const res = await apiClient.put<Platform>(`/platforms/${id}`, data);
    return res.data;
  },

  async deletePlatform(id: string): Promise<void> {
    await apiClient.delete(`/platforms/${id}`);
  },
};
