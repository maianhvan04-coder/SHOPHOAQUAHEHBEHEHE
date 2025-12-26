import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const productApi = {
    list: (params) => apiClient.get(endpoints.products.list, { params }),
    create: (data) => apiClient.post(endpoints.products.create, data),
    update: (id, data) => apiClient.patch(endpoints.products.update(id), data),
    getById: (id) => apiClient.get(endpoints.products.detail(id)),
    changeStatus: (id, isActive) =>
        apiClient.patch(endpoints.products.changeStatus(id), { isActive }),
};
