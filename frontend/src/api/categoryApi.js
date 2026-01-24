import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const categoryApi = {
  async list(params) {
    const res = await apiClient.get(endpoints.categories.list, { params });

    const dt = res?.data?.DT || {};
    const categories = Array.isArray(dt.categories) ? dt.categories : [];

    return {
      items: categories,
      pagination: {
        page: Number(dt.page || 1),
        limit: Number(dt.limit || params?.limit || 10),
        total: Number(dt.totalItems || categories.length || 0),
        totalPages: Number(dt.totalPages || 1),
      },
      ec: res?.data?.EC,
      em: res?.data?.EM,
    };
  },

  create: (data) => apiClient.post(endpoints.categories.create, data),
  getById: (id) => apiClient.get(endpoints.categories.detail(id)),
  update: (id, data) => apiClient.patch(endpoints.categories.update(id), data),

  // soft delete (DELETE /:id)
  remove: (id) => apiClient.delete(endpoints.categories.remove(id)),
  getForProduct: () => apiClient.get(endpoints.categories.getForProduct),
  // restore (PATCH /:id/restore)
  restore: (id) => apiClient.patch(endpoints.categories.restore(id)),

  // ✅ hard delete (DELETE /:id/hard)
  hardDelete: (id) => apiClient.delete(endpoints.categories.hardDelete(id)),
};
