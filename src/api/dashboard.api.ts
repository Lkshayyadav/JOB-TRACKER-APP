import { apiClient } from "./client";
import { DashboardStats } from "../types";

export const DashboardAPI = {
  async getDashboard(): Promise<DashboardStats> {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>("/dashboard");
    return res.data.data;
  },
};
