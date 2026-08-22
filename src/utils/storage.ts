import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG } from "../constants/config";

export const Storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (e) {
      console.error("Storage setItem error:", e);
    }
  },

  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error("Storage getItem error:", e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Storage removeItem error:", e);
    }
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([
      APP_CONFIG.storageKeys.accessToken,
      APP_CONFIG.storageKeys.refreshToken,
      APP_CONFIG.storageKeys.user,
    ]);
  },
};
