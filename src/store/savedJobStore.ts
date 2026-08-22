import { create } from "zustand";
import { SavedJob } from "../types";
import { SavedJobAPI } from "../api/savedJob.api";

interface SavedJobState {
  savedJobs: SavedJob[];
  isLoading: boolean;
  error: string | null;
  fetchSavedJobs: () => Promise<void>;
  createSavedJob: (data: Partial<SavedJob>) => Promise<boolean>;
  deleteSavedJob: (id: string) => Promise<boolean>;
  applySavedJob: (id: string) => Promise<boolean>;
}

export const useSavedJobStore = create<SavedJobState>((set) => ({
  savedJobs: [],
  isLoading: false,
  error: null,

  fetchSavedJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await SavedJobAPI.getSavedJobs();
      set({ savedJobs: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load saved jobs", isLoading: false });
    }
  },

  createSavedJob: async (data) => {
    try {
      const created = await SavedJobAPI.createSavedJob(data);
      set((state) => ({ savedJobs: [created, ...state.savedJobs] }));
      return true;
    } catch {
      return false;
    }
  },

  deleteSavedJob: async (id) => {
    try {
      await SavedJobAPI.deleteSavedJob(id);
      set((state) => ({ savedJobs: state.savedJobs.filter((j) => j._id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  applySavedJob: async (id) => {
    try {
      await SavedJobAPI.applySavedJob(id);
      set((state) => ({ savedJobs: state.savedJobs.filter((j) => j._id !== id) }));
      return true;
    } catch {
      return false;
    }
  },
}));
