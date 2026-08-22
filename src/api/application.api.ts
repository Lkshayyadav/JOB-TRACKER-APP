import { apiClient } from "./client";
import { Application, ApplicationHistory, ApplicationStatus, FilterParams } from "../types";

export const DEFAULT_APPLICATIONS: Application[] = [
  {
    _id: "app-1",
    userId: "demo-user",
    company: "Xapo Bank",
    role: "Visual Designer Graduate (Remote - Work from Anywhere)",
    platformId: "p-6",
    status: "Applied",
    appliedDate: "2026-07-25",
    priority: "Medium",
    notes: "Applied via WorkingNomads careers portal. Portfolio shared.",
    isPinned: true,
    companyWebsite: "https://xapobank.com",
    applicationMethod: "WorkingNomads",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "app-2",
    userId: "demo-user",
    company: "VRChat",
    role: "Engineer - Social Experience (Mid-Staff)",
    platformId: "p-6",
    status: "Applied",
    appliedDate: "2026-07-25",
    priority: "Medium",
    notes: "Focus area: Real-time synchronization and avatars.",
    isPinned: false,
    companyWebsite: "https://vrchat.com",
    applicationMethod: "WorkingNomads",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "app-3",
    userId: "demo-user",
    company: "Xplor",
    role: "Fullstack Software Engineer - Embedded Payments",
    platformId: "p-6",
    status: "Applied",
    appliedDate: "2026-07-25",
    priority: "Medium",
    notes: "Direct referral application submitted.",
    isPinned: false,
    companyWebsite: "https://xplor.com",
    applicationMethod: "WorkingNomads",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "app-4",
    userId: "demo-user",
    company: "Stripe",
    role: "Senior Mobile Engineer",
    platformId: "p-1",
    status: "Technical Round",
    appliedDate: "2026-07-15",
    followUpDate: "2026-08-25",
    priority: "High",
    notes: "Completed Recruiter screen. Technical architecture round scheduled.",
    isPinned: true,
    companyWebsite: "https://stripe.com",
    applicationMethod: "LinkedIn",
    recruiterName: "Sarah Vance",
    recruiterEmail: "sarah.vance@stripe.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "app-5",
    userId: "demo-user",
    company: "Coinbase",
    role: "Lead Frontend Engineer",
    platformId: "p-1",
    status: "OA",
    appliedDate: "2026-07-18",
    followUpDate: "2026-08-26",
    priority: "High",
    notes: "HackerRank online assessment received. Focus: state synchronization.",
    isPinned: true,
    companyWebsite: "https://coinbase.com",
    applicationMethod: "Website",
    recruiterName: "Elena Rostova",
    recruiterEmail: "elena@coinbase.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "app-6",
    userId: "demo-user",
    company: "Linear",
    role: "Staff Product Engineer",
    platformId: "p-2",
    status: "Offer",
    appliedDate: "2026-07-02",
    priority: "High",
    notes: "Formal offer received ($210,000 + 0.15% equity). Reviewing contract terms.",
    isPinned: true,
    companyWebsite: "https://linear.app",
    applicationMethod: "Wellfound",
    recruiterName: "Julian Thorne",
    recruiterEmail: "julian@linear.app",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ApplicationAPI = {
  async getApplications(params?: FilterParams): Promise<Application[]> {
    try {
      const res = await apiClient.get<{ success: boolean; count: number; data: Application[] }>("/applications", { params });
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return res.data.data;
      }
      return DEFAULT_APPLICATIONS;
    } catch {
      return DEFAULT_APPLICATIONS;
    }
  },

  async getApplication(id: string): Promise<Application> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Application }>(`/applications/${id}`);
      return res.data.data;
    } catch {
      const found = DEFAULT_APPLICATIONS.find((a) => a._id === id);
      if (found) return found;
      throw new Error("Application not found");
    }
  },

  async createApplication(data: Partial<Application>): Promise<Application> {
    try {
      const res = await apiClient.post<{ success: boolean; data: Application }>("/applications", data);
      return res.data.data;
    } catch {
      const newApp: Application = {
        _id: `app-local-${Date.now()}`,
        userId: "demo-user",
        company: data.company || "Company",
        role: data.role || "Role",
        status: data.status || "Applied",
        priority: data.priority || "Medium",
        appliedDate: data.appliedDate || new Date().toISOString().split("T")[0],
        followUpDate: data.followUpDate,
        notes: data.notes,
        isPinned: Boolean(data.isPinned),
        applicationMethod: data.applicationMethod,
        recruiterName: data.recruiterName,
        recruiterEmail: data.recruiterEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newApp;
    }
  },

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    try {
      const res = await apiClient.put<{ success: boolean; data: Application }>(`/applications/${id}`, data);
      return res.data.data;
    } catch {
      return {
        _id: id,
        userId: "demo-user",
        company: data.company || "Company",
        role: data.role || "Role",
        status: data.status || "Applied",
        priority: data.priority || "Medium",
        appliedDate: data.appliedDate || new Date().toISOString().split("T")[0],
        followUpDate: data.followUpDate,
        notes: data.notes,
        isPinned: Boolean(data.isPinned),
        applicationMethod: data.applicationMethod,
        recruiterName: data.recruiterName,
        recruiterEmail: data.recruiterEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      await apiClient.delete(`/applications/${id}`);
    } catch {
      // ignore
    }
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    try {
      const res = await apiClient.patch<{ success: boolean; data: Application }>(`/applications/${id}/status`, { status });
      return res.data.data;
    } catch {
      return {
        _id: id,
        userId: "demo-user",
        company: "Company",
        role: "Role",
        status,
        priority: "Medium",
        appliedDate: new Date().toISOString().split("T")[0],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async getHistory(id: string): Promise<ApplicationHistory[]> {
    try {
      const res = await apiClient.get<{ success: boolean; count: number; data: ApplicationHistory[] }>(`/applications/${id}/history`);
      return res.data.data;
    } catch {
      return [
        {
          _id: "h-1",
          applicationId: id,
          previousStatus: "Wishlist",
          newStatus: "Applied",
          changedAt: new Date().toISOString(),
          notes: "Application created",
        },
      ];
    }
  },

  async duplicateApplication(id: string): Promise<Application> {
    const res = await apiClient.post<{ success: boolean; data: Application }>(`/applications/${id}/duplicate`);
    return res.data.data;
  },
};
