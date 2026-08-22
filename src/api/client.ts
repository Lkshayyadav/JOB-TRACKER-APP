import axios from "axios";
import { APP_CONFIG } from "../constants/config";
import { Storage } from "../utils/storage";

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.timeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem<string>(APP_CONFIG.storageKeys.accessToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration Gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Gracefully clear credentials without throwing disruptive warning dialogs
      await Storage.clearAuth();
    }
    return Promise.reject(error);
  }
);
