export const APP_CONFIG = {
  appName: "JobTrack",
  version: "1.0.0",
  // Production Render Backend API URL
  apiBaseUrl: "https://job-tracker-icbp.onrender.com/api",
  // Local fallback backend URL
  localApiBaseUrl: "http://localhost:5000/api",
  timeoutMs: 45000,
  storageKeys: {
    accessToken: "jobtrack_access_token",
    refreshToken: "jobtrack_refresh_token",
    user: "jobtrack_user_data",
    theme: "jobtrack_theme_preference",
  },
};
