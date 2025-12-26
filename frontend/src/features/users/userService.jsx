import apiClient from "~/services/apiClient";
import { endpoints } from "../../services/endpoints";

export const userService = {
  async getAll(params = {}) {
    const res = await apiClient.get(endpoints.users.getAll, { params });
    const items = res?.data.result?.items || [];
    const pagination = res?.data.result?.pagination || null;
    return { items, pagination };
  },

  async create(payload) {
    return apiClient.post(endpoints.users.create, payload);
  },

  async update(id, payload) {
    return apiClient.patch(endpoints.users.update(id), payload);
  },

  remove(id) {
    return apiClient.delete(endpoints.users.remove(id));
  },

  bulkSetStatus(ids, isActive) {
    return apiClient.patch(endpoints.users.bulkSetStatus, { ids, isActive });
  },

  bulkSoftDelete(ids) {
    return apiClient.patch(endpoints.users.bulkSoftDelete, { ids });
  },
};

