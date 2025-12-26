// src/services/apiClient.js
import axios from "axios";
import { authStorage } from "~/features/auth/authStorage";
import { endpoints } from "./endpoints";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  timeout: 15000,
});

// attach access token
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// refresh + retry once
let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status !== 401 || original?._retry) throw err;

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await apiClient.post(endpoints.auth.refresh);
      const data = refreshRes?.data?.data ?? refreshRes?.data;
      const newToken = data?.accessToken;

      if (!newToken) throw err;

      authStorage.setToken(newToken);
      resolveQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (e) {
      resolveQueue(e, null);
      authStorage.clear();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
