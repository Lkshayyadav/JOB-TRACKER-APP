import { create } from "zustand";
import { User } from "../types";
import { AuthAPI } from "../api/auth.api";
import { Storage } from "../utils/storage";
import { APP_CONFIG } from "../constants/config";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthAPI.login({ email, password });
      await Storage.setItem(APP_CONFIG.storageKeys.accessToken, data.accessToken);
      if (data.refreshToken) {
        await Storage.setItem(APP_CONFIG.storageKeys.refreshToken, data.refreshToken);
      }
      await Storage.setItem(APP_CONFIG.storageKeys.user, data.user);
      set({ user: data.user, token: data.accessToken, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to login";
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthAPI.register({ name, email, password });
      await Storage.setItem(APP_CONFIG.storageKeys.accessToken, data.accessToken);
      if (data.refreshToken) {
        await Storage.setItem(APP_CONFIG.storageKeys.refreshToken, data.refreshToken);
      }
      await Storage.setItem(APP_CONFIG.storageKeys.user, data.user);
      set({ user: data.user, token: data.accessToken, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await Storage.getItem<string>(APP_CONFIG.storageKeys.accessToken);
      const savedUser = await Storage.getItem<User>(APP_CONFIG.storageKeys.user);

      if (token && savedUser) {
        set({ user: savedUser, token });
        // Validate with server in background
        try {
          const res = await AuthAPI.getMe();
          if (res.user) {
            set({ user: res.user });
            await Storage.setItem(APP_CONFIG.storageKeys.user, res.user);
          }
        } catch {
          // Token might still be valid or backend offline
        }
      }
    } catch {
      // ignore
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },

  logout: async () => {
    await AuthAPI.logout();
    await Storage.clearAuth();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
