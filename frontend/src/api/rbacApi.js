import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const rbacApi = {
    listRoles: () => apiClient.get(endpoints.rbac.roles),
    listPermissions: () => apiClient.get(endpoints.rbac.permissions),
    catalog: () => apiClient.get(endpoints.rbac.catalog),
    syncAdminAllPermissions: () => apiClient.post(endpoints.rbac.syncAdmin),

    setRolePermissions: (payload) => apiClient.post(endpoints.rbac.setRolePermissions, payload),
    setUserRoles: (payload) => apiClient.post(endpoints.rbac.setUserRoles, payload),
    setUserOverride: (payload) => apiClient.post(endpoints.rbac.setUserOverride, payload),

    removeUserOverride: (payload) =>
        apiClient.delete(endpoints.rbac.removeUserOverride, { data: payload }),

    // FIX: đúng param shape
    getPermissionByRole: ({ roleCode }) =>
        apiClient.get(endpoints.rbac.getPermissionByRole({ roleCode })),

    // CRUD roles
    createRole: (payload) => apiClient.post(endpoints.rbac.createRole, payload),
    updateRole: ({ id, ...payload }) => apiClient.patch(endpoints.rbac.updateRole(id), payload),
    deleteRole: ({ id }) => apiClient.delete(endpoints.rbac.roleById(id)),
    toggleRoleStatus: ({ id }) => apiClient.patch(endpoints.rbac.rolesStatus({ id })),

};
