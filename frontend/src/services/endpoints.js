const v1 = "/api/v1"
const v1Admin = "/api/v1/admin"
export const endpoints = {
  auth: {
    login: `${v1}/auth/login`,
    refresh: `${v1}/auth/refresh-token`,
    me: `${v1}/auth/me`,
    register: `${v1}/auth/register`,
    logout: `${v1}/auth/logout`,
  },
  users: {
    getAll: `${v1Admin}/user`,
    create: `${v1Admin}/user`,
    update: (id) => `${v1Admin}/user/${id}`,
    remove: (id) => `${v1Admin}/user/${id}`,
    bulkSetStatus: `${v1Admin}/user/bulk/status`,
    bulkSoftDelete: `${v1Admin}/user/bulk/delete`,
  },

  categories: {
    list: `${v1Admin}/category`,           // GET (list)
    create: `${v1Admin}/category/create`,  // POST (create)
    detail: (id) => `${v1Admin}/category/${id}`,
    update: (id) => `${v1Admin}/category/${id}`, // PATCH
    remove: (id) => `${v1Admin}/category/${id}`, // DELETE hoặc PATCH soft delete
  },
  products: {
    list: `${v1Admin}/product`,
    create: `${v1Admin}/product`,
    detail: (id) => `${v1Admin}/product/${id}`,
    update: (id) => `${v1Admin}/product/update/${id}`,
    remove: (id) => `${v1Admin}/product/${id}`,
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
    getPermissionByRole: ({ roleCode }) => `${v1Admin}/rbac/roles/${encodeURIComponent(roleCode)}/permissions`

  },


  upload: {
    signature: `${v1Admin}/upload/signature`,
  },
};
