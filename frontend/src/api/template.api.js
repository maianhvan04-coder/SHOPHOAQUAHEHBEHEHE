// src/features/products/apis/productApi.js

import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const templateApi = {
    getTemplates: (params) => apiClient.get(endpoints.template.getTemplates, { params }),

    createTemplate: (data) => apiClient.post(endpoints.template.createTemplate, data),
    detailsTemplate: (type) => apiClient.get(endpoints.template.detailTemplate(type)),
    createTemplateVersion: (type, data) => apiClient.post(endpoints.template.createTemplateVersion(type), data),
    activateTemplateVersion: (type, version) => apiClient.put(endpoints.template.activateTemplateVersion(type, version)),
    updateTemplateVersion: (type, version, data) => apiClient.put(endpoints.template.updateTemplateVersion(type, version), data)

    ,
    getTemplateVersion: (type, version) => apiClient.get(endpoints.template.getTemplateVersion(type, version)),
    getProductDescriptionTemplates: () => apiClient.get(endpoints.template.productDescriptionTemplateApi),
    // changeStatus: (id, isActive) =>
    //     apiClient.patch(endpoints.template.changeStatus(id), { isActive }),
};
