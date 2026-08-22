import { apiClient } from "./client";
import { Application, SavedJob } from "../types";

export const SavedJobAPI = {
  async getSavedJobs(): Promise<SavedJob[]> {
    const res = await apiClient.get<{ success: boolean; count: number; data: SavedJob[] }>("/saved-jobs");
    return res.data.data;
  },

  async createSavedJob(data: Partial<SavedJob>): Promise<SavedJob> {
    const res = await apiClient.post<{ success: boolean; data: SavedJob }>("/saved-jobs", data);
    return res.data.data;
  },

  async deleteSavedJob(id: string): Promise<void> {
    await apiClient.delete(`/saved-jobs/${id}`);
  },

  async applySavedJob(id: string): Promise<Application> {
    const res = await apiClient.post<{ success: boolean; data: Application }>(`/saved-jobs/${id}/apply`);
    return res.data.data;
  },
};
