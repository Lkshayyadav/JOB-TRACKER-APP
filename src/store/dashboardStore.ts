import { create } from "zustand";
import { DashboardStats } from "../types";
import { DashboardAPI } from "../api/dashboard.api";

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await DashboardAPI.getDashboard();
      set({ stats: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load dashboard", isLoading: false });
    }
  },
}));
