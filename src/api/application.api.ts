import { apiClient } from "./client";
import { Application, ApplicationHistory, ApplicationStatus, FilterParams } from "../types";

export const ApplicationAPI = {
  async getApplications(params?: FilterParams): Promise<Application[]> {
    const res = await apiClient.get<{ success: boolean; count: number; data: Application[] }>("/applications", { params });
    return res.data.data;
  },

  async getApplication(id: string): Promise<Application> {
    const res = await apiClient.get<{ success: boolean; data: Application }>(`/applications/${id}`);
    return res.data.data;
  },

  async createApplication(data: Partial<Application>): Promise<Application> {
    const res = await apiClient.post<{ success: boolean; data: Application }>("/applications", data);
    return res.data.data;
  },

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const res = await apiClient.put<{ success: boolean; data: Application }>(`/applications/${id}`, data);
    return res.data.data;
  },

  async deleteApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`);
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const res = await apiClient.patch<{ success: boolean; data: Application }>(`/applications/${id}/status`, { status });
    return res.data.data;
  },

  async getHistory(id: string): Promise<ApplicationHistory[]> {
    const res = await apiClient.get<{ success: boolean; count: number; data: ApplicationHistory[] }>(`/applications/${id}/history`);
    return res.data.data;
  },

  async duplicateApplication(id: string): Promise<Application> {
    const res = await apiClient.post<{ success: boolean; data: Application }>(`/applications/${id}/duplicate`);
    return res.data.data;
  },
};
