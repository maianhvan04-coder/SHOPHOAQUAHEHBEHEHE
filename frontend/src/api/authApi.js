// src/api/authApi.js
import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const authApi = {
  login: (payload) => apiClient.post(endpoints.auth.login, payload),
  register: (payload) => apiClient.post(endpoints.auth.register, payload),
  me: () => apiClient.get(endpoints.auth.me),
  refresh: () => apiClient.post(endpoints.auth.refresh),
  logout: () => apiClient.post(endpoints.auth.logout),
};
