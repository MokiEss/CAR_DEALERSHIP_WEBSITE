import axios from "axios";
import { clearAuthToken, getAuthToken } from "./authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      getAuthToken() &&
      window.location.pathname.startsWith("/admin")
    ) {
      clearAuthToken();
      window.location.assign("/admin/login");
    }

    return Promise.reject(error);
  }
);

export default api;