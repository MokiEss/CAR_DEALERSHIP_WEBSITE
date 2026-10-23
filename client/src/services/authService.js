import axios from "axios";

const TOKEN_KEY = "admin_token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export async function loginAdmin(username, password) {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    { username, password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}