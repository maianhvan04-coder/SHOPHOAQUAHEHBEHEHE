import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";
// src/api/rbacApi.js

export const rbacApi = {
    listRoles: () => apiClient.get(endpoints.rbac.roles),
    listPermissions: () => apiClient.get(endpoints.rbac.permissions),
    catalog: () => apiClient.get(endpoints.rbac.catalog),
    syncAdminAllPermissions: () => apiClient.post(endpoints.rbac.syncAdmin),

    setRolePermissions: (payload) =>
        apiClient.post(endpoints.rbac.setRolePermissions, payload),

    setUserRoles: (payload) =>
        apiClient.post(endpoints.rbac.setUserRoles, payload),

    setUserOverride: (payload) =>
        apiClient.post(endpoints.rbac.setUserOverride, payload),
    getPermissionByRole: (rodeCode) => apiClient.get(endpoints.rbac.getPermissionByRole(rodeCode)),
    removeUserOverride: (payload) =>
        apiClient.delete(endpoints.rbac.removeUserOverride, { data: payload }),
};
