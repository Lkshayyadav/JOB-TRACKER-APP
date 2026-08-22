export function getErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Server is waking up (Render free tier). Please try again in a few seconds.";
  }
  if (error.message?.includes("Network Error")) {
    return "Server connecting... Tap once more to complete.";
  }
  if (error.message) return error.message;
  return "Unable to connect to server. Please try again.";
}
