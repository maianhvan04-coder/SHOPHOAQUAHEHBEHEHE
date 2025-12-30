import { rbacApi } from "~/api/rbacApi";

const unwrap = (res) => res?.data?.data ?? res?.data;

export const rbacService = {
    async getRoles() {
        const res = await rbacApi.listRoles();
        const data = unwrap(res);
        return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    },

    async getPermissions() {
        const res = await rbacApi.listPermissions();
        const data = unwrap(res);
        return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    },

    async syncAdminAllPermissions() {
        const res = await rbacApi.syncAdminAllPermissions();
        return unwrap(res);
    },

    async setRolePermissions({ roleCode, permissionKeys }) {
        const res = await rbacApi.setRolePermissions({ roleCode, permissionKeys });
        return unwrap(res);
    },

    async getRolePermissions(code) {
        const res = await rbacApi.getPermissionByRole({ roleCode: code });
        return unwrap(res);
    },

    // ✅ CRUD ROLES
    async createRole(payload) {
        const res = await rbacApi.createRole(payload);
        return unwrap(res);
    },

    async updateRole(id, payload) {
        const res = await rbacApi.updateRole({ id, ...payload });
        // hoặc rbacApi.updateRole(id, payload) tuỳ bạn định nghĩa rbacApi
        return unwrap(res);
    },

    async deleteRole(id) {
        const res = await rbacApi.deleteRole({ id });
        return unwrap(res);
    },

    async toggleRoleStatus(id) {
        const res = await rbacApi.toggleRoleStatus({ id });
        return unwrap(res);
    }

};
