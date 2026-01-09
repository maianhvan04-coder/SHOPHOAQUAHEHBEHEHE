const v1 = "/api/v1";
const v1Admin = "/api/v1/admin";
export const endpoints = {
  auth: {
    login: `${v1}/auth/login`,
    refresh: `${v1}/auth/refresh-token`,
    me: `${v1}/auth/me`,
    register: `${v1}/auth/register`,
    logout: `${v1}/auth/logout`,
    forgotPassword: `${v1}/auth/forgot-password`, 
    resetPassword: `${v1}/auth/reset-password`,
  },
  users: {
    getAll: `${v1Admin}/user`,
    create: `${v1Admin}/user`,
    update: (id) => `${v1Admin}/user/${id}`,
    remove: (id) => `${v1Admin}/user/${id}`,
    restore: (id) => `${v1Admin}/user/${id}/restore`,
    bulkSetStatus: `${v1Admin}/user/bulk/status`,
    bulkSoftDelete: `${v1Admin}/user/bulk/delete`,
    getAssignableRoles: `${v1Admin}/user/assignable-roles`,

  },

  categories: {
  list: `${v1Admin}/category`,              // GET
  create: `${v1Admin}/category/create`,     // POST
  detail: (id) => `${v1Admin}/category/${id}`,
  update: (id) => `${v1Admin}/category/${id}`, // PATCH

  // soft delete -> vào thùng rác
  remove: (id) => `${v1Admin}/category/${id}`, // DELETE

  // ✅ restore từ thùng rác
  restore: (id) => `${v1Admin}/category/${id}/restore`, // PATCH

  // ✅ hard delete (xóa vĩnh viễn) - chỉ khi isDeleted=true
  hardDelete: (id) => `${v1Admin}/category/${id}/hard`,  // DELETE
},

  products: {
    list: `${v1Admin}/product`,
    create: `${v1Admin}/product`,
    detail: (id) => `${v1Admin}/product/${id}`,
    update: (id) => `${v1Admin}/product/update/${id}`,
    delete: (id) => `${v1Admin}/product/delete/${id}`,
    changeStatus: (id) => `${v1Admin}/product/${id}/status`,
  },
  rbac: {
    roles: `${v1Admin}/rbac/roles`,
    permissions: `${v1Admin}/rbac/permissions`,
    syncAdmin: `${v1Admin}/rbac/sync-admin`,
    setRolePermissions: `${v1Admin}/rbac/role-permissions`,
    setUserRoles: `${v1Admin}/rbac/user-roles`,
    setUserOverride: `${v1Admin}/rbac/user-override`,
    removeUserOverride: `${v1Admin}/rbac/user-override`,
    catalog: `${v1Admin}/rbac/catalog`,

    // ROLES
    getPermissionByRole: ({ roleCode }) =>
      `${v1Admin}/rbac/roles/${encodeURIComponent(roleCode)}/permissions`,

    roleById: (id) => `${v1Admin}/rbac/roles/${encodeURIComponent(id)}`,
    rolesStatus: ({ id }) => `${v1Admin}/rbac/roles/${id}/status`,
  },

  upload: {
    signature: `${v1Admin}/upload/signature`,
  },
  chat: {
  send: `${v1}/chat`,
},
};
