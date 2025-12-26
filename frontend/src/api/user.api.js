import { axiosUser } from "../shared/utils/axios.custiomize";

import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const userApi = {
  list: (params) => apiClient.get(endpoints.users.getAll, { params }),
};

// ===== USER =====
export const getUsersApi = (params) =>
  axiosUser.get("/api/v1/users", { params });

export const getUserDetailApi = (id) =>
  axiosUser.get(`/api/v1/users/${id}`);

export const updateProfileApi = (data) =>
  axiosUser.put("/api/v1/users/me/profile", data);

export const changePasswordApi = (data) =>
  axiosUser.put("/api/v1/users/me/change-password", data);
