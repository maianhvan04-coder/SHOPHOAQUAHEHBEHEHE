// src/services/apiClient.js
import axios from "axios";
import { authStorage } from "~/features/auth/authStorage";
import { endpoints } from "./endpoints";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  timeout: 15000,
});

// ===== attach access token =====
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== refresh + retry once =====
let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

// helper: các endpoint không auto-refresh
function isAuthEndpoint(url = "") {
  const u = String(url || "");
  return (
    u.includes("/auth/login") ||
    u.includes("/auth/register") ||
    u.includes("/auth/refresh-token") || // ✅ đúng backend của bạn
    u.includes("/auth/logout") ||
    u.includes("/auth/forgot-password") || // ✅ thêm
    u.includes("/auth/reset-password") // ✅ thêm
  );
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err?.config;
    const status = err?.response?.status;
    const url = original?.url || "";

    // ✅ 1) endpoint auth => trả thẳng về catch để lấy message BE
    if (isAuthEndpoint(url)) {
      throw err;
    }

    // ✅ 2) không có access token thì khỏi refresh
    const hasToken = !!authStorage.getToken();
    if (!hasToken) {
      throw err;
    }

    // ✅ 3) chỉ xử lý 401 và chỉ retry 1 lần
    if (status !== 401 || original?._retry) {
      throw err;
    }

    original._retry = true;

    // ✅ 4) nếu đang refresh thì xếp hàng
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    // ✅ 5) bắt đầu refresh
    isRefreshing = true;
    try {
      const refreshRes = await apiClient.post(endpoints.auth.refresh);
      const data = refreshRes?.data?.data ?? refreshRes?.data;
      const newToken = data?.accessToken;

      if (!newToken) throw err;

      authStorage.setToken(newToken);
      resolveQueue(null, newToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (e) {
      resolveQueue(e, null);
      authStorage.clear(); // xoá access token + me cache nếu có
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
