import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const categoryApi = {
    list: (params) =>
        apiClient.get(endpoints.categories.list, { params }),

    create: (data) =>
        apiClient.post(endpoints.categories.create, data),
    getById: (id) => apiClient.get(endpoints.categories.detail(id)),
    update: (id, data) =>
        apiClient.patch(endpoints.categories.update(id), data),

    remove: (id) =>
        apiClient.delete(endpoints.categories.remove(id)),
};

