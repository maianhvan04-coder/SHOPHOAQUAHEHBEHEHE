import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const auditApi = {
    /**
     * Lấy lịch sử audit của 1 sản phẩm
     * @param {string} productId
     * @param {{ page?: number, limit?: number }} params
     */
    getProductHistory: (productId, params = {}) =>
        apiClient.get(endpoints.audit.ProductHistory(productId), {
            params,
        }),
    getProductAuditDetail: (auditId) =>
        apiClient.get(endpoints.audit.getProductAuditDetail(auditId)),
    getProductAuditList: (params) =>
        apiClient.get(endpoints.audit.getProductAuditList, { params }),
    getSecurityAuditList: (params) =>
        apiClient.get(endpoints.audit.getSecurityAuditList, { params }),
};
