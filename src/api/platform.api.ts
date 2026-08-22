import { apiClient } from "./client";
import { Platform } from "../types";

export const DEFAULT_PLATFORMS: Platform[] = [
  {
    _id: "p-1",
    userId: "demo-user",
    name: "LinkedIn",
    url: "https://linkedin.com",
    color: "#0A66C2",
    isDefault: true,
    totalApplications: 8,
    successRate: 38,
  },
  {
    _id: "p-2",
    userId: "demo-user",
    name: "Wellfound",
    url: "https://wellfound.com",
    color: "#E54D2E",
    isDefault: false,
    totalApplications: 5,
    successRate: 40,
  },
  {
    _id: "p-3",
    userId: "demo-user",
    name: "Indeed",
    url: "https://indeed.com",
    color: "#2563EB",
    isDefault: false,
    totalApplications: 6,
    successRate: 33,
  },
  {
    _id: "p-4",
    userId: "demo-user",
    name: "Company Careers Portal",
    url: "https://stripe.com/jobs",
    color: "#10B981",
    isDefault: false,
    totalApplications: 7,
    successRate: 45,
  },
  {
    _id: "p-5",
    userId: "demo-user",
    name: "Warm Referral",
    url: "",
    color: "#8B5CF6",
    isDefault: false,
    totalApplications: 3,
    successRate: 67,
  },
  {
    _id: "p-6",
    userId: "demo-user",
    name: "WorkingNomads",
    url: "https://workingnomads.com",
    color: "#CCFF00",
    isDefault: false,
    totalApplications: 4,
    successRate: 25,
  },
];

export const PlatformAPI = {
  async getPlatforms(): Promise<Platform[]> {
    try {
      const res = await apiClient.get<Platform[]>("/platforms");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_PLATFORMS;
    } catch {
      return DEFAULT_PLATFORMS;
    }
  },

  async getPlatformStats(): Promise<Platform[]> {
    try {
      const res = await apiClient.get<Platform[]>("/platforms/stats");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_PLATFORMS;
    } catch {
      return DEFAULT_PLATFORMS;
    }
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
