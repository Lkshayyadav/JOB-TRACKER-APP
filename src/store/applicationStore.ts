import { create } from "zustand";
import { Application, ApplicationStatus, ApplicationPriority } from "../types";
import { ApplicationAPI } from "../api/application.api";

interface ApplicationState {
  applications: Application[];
  selectedStage: ApplicationStatus | "All";
  searchQuery: string;
  selectedPriority: ApplicationPriority | "All";
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: () => Promise<void>;
  setSelectedStage: (stage: ApplicationStatus | "All") => void;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: ApplicationPriority | "All") => void;
  createApplication: (data: Partial<Application>) => Promise<boolean>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
  updateStatus: (id: string, newStatus: ApplicationStatus) => Promise<boolean>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  selectedStage: "All",
  searchQuery: "",
  selectedPriority: "All",
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ApplicationAPI.getApplications();
      set({ applications: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load applications", isLoading: false });
    }
  },

  setSelectedStage: (stage) => set({ selectedStage: stage }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),

  createApplication: async (data) => {
    try {
      const newApp = await ApplicationAPI.createApplication(data);
      set((state) => ({ applications: [newApp, ...state.applications] }));
      return true;
    } catch {
      return false;
    }
  },

  updateApplication: async (id, data) => {
    try {
      const updated = await ApplicationAPI.updateApplication(id, data);
      set((state) => ({
        applications: state.applications.map((a) => (a._id === id ? updated : a)),
      }));
      return true;
    } catch {
      return false;
    }
  },

  deleteApplication: async (id) => {
    try {
      await ApplicationAPI.deleteApplication(id);
      set((state) => ({
        applications: state.applications.filter((a) => a._id !== id),
      }));
      return true;
    } catch {
      return false;
    }
  },

  updateStatus: async (id, newStatus) => {
    // Optimistic UI Update
    const prevApps = get().applications;
    set((state) => ({
      applications: state.applications.map((a) =>
        a._id === id ? { ...a, status: newStatus } : a
      ),
    }));

    try {
      await ApplicationAPI.updateStatus(id, newStatus);
      return true;
    } catch {
      // Revert on failure
      set({ applications: prevApps });
      return false;
    }
  },
}));
