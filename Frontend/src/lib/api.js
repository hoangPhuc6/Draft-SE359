import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/auth/refresh-token", null, { withCredentials: true })
      .then((res) => {
        const newToken = res.data?.data?.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/login") &&
      !original.url.includes("/auth/refresh-token")
    ) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        useAuthStore.getState().clear();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

export function apiMessage(
  error,
  fallback = "Có lỗi xảy ra, vui lòng thử lại",
) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
