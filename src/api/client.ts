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

// Response Interceptor: Handle Token Expiration Gracefully & Auto-Retry Cold Starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config && !config._retry && (error.code === "ECONNABORTED" || !error.response)) {
      config._retry = true;
      config.timeout = 50000;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      await Storage.clearAuth();
    }
    return Promise.reject(error);
  }
);
