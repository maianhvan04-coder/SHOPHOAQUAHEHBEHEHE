// src/constants/rbac.catalog.js
// - Dùng để:
//   1) Seed Permission vào DB (từ PERMISSION_META_LIST)
//   2) UI build menu/screen + map route/action -> permission
//   3) Guard/authorize theo permission key
//
// Gợi ý seed DB: upsert Permission theo permissionMetaList bên dưới.

const PERMISSION_GROUPS = Object.freeze({
    USERS: { key: "USERS", label: "Người dùng", icon: "users", order: 10 },
    CATALOG: { key: "CATALOG", label: "Danh mục & Sản phẩm", icon: "box", order: 20 },
    ORDERS: { key: "ORDERS", label: "Đơn hàng", icon: "receipt", order: 30 },
    SYSTEM: { key: "SYSTEM", label: "Hệ thống", icon: "settings", order: 99 },
});

// =====================================================
// 1) PERMISSIONS: keys chuẩn để guard backend & FE check
// =====================================================
const PERMISSIONS = Object.freeze({
    // ===== ADMIN =====
    RBAC_MANAGE: "rbac:manage",
    // ===== USERS =====
    USER_READ: "user:read",
    USER_CREATE: "user:create",
    USER_UPDATE: "user:update",
    USER_DELETE: "user:delete",
    USER_CHANGE_STATUS: "user:status",
    USER_BULK_STATUS: "user:bulk_status",
    USER_BULK_DELETE: "user:bulk_delete",
    USER_UPLOAD_AVATAR: "user:upload_avatar",
    USER_SET_ROLES: "user:set_roles",


    // ===== CATEGORIES =====
    CATEGORY_READ: "category:read",
    CATEGORY_CREATE: "category:create",
    CATEGORY_UPDATE: "category:update",
    CATEGORY_DELETE: "category:delete",
    CATEGORY_CHANGE_STATUS: "category:status",

    // ===== PRODUCTS =====
    PRODUCT_READ: "product:read",
    PRODUCT_CREATE: "product:create",
    PRODUCT_UPDATE: "product:update",
    PRODUCT_DELETE: "product:delete",
    PRODUCT_CHANGE_STATUS: "product:status",

    // ===== ORDERS =====
    ORDER_READ: "order:read",
    ORDER_CREATE: "order:create",
    ORDER_UPDATE: "order:update",
    ORDER_DELETE: "order:delete",
    ORDER_UPDATE_STATUS: "order:status",

    // ===== RBAC / SYSTEM =====
    RBAC_READ: "rbac:read",
    RBAC_CREATE_ROLE: "rbac:role_create",
    RBAC_UPDATE_ROLE: "rbac:role_update",
    RBAC_DELETE_ROLE: "rbac:role_delete",

    RBAC_READ_PERMISSION: "rbac:permission_read",
    RBAC_CREATE_PERMISSION: "rbac:permission_create",
    RBAC_UPDATE_PERMISSION: "rbac:permission_update",
    RBAC_DELETE_PERMISSION: "rbac:permission_delete",

    RBAC_SET_ROLE_PERMISSIONS: "rbac:set_role_permissions",
    RBAC_SET_USER_ROLES: "rbac:set_user_roles",
    RBAC_SET_USER_OVERRIDE: "rbac:set_user_override",
    RBAC_REMOVE_USER_OVERRIDE: "rbac:remove_user_override",

    RBAC_SYNC_ADMIN: "rbac:sync_admin",
});

// =====================================================
// 2) PERMISSION_META: tiếng Việt + group + order
//    -> cái này dùng để seed DB Permission
// =====================================================
const PERMISSION_META = Object.freeze({
    // ===== USERS =====
    [PERMISSIONS.USER_READ]: {
        key: PERMISSIONS.USER_READ,
        resource: "user",
        action: "read",
        label: "Xem danh sách / chi tiết người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 10,
    },
    [PERMISSIONS.USER_CREATE]: {
        key: PERMISSIONS.USER_CREATE,
        resource: "user",
        action: "create",
        label: "Thêm người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 20,
    },
    [PERMISSIONS.USER_UPDATE]: {
        key: PERMISSIONS.USER_UPDATE,
        resource: "user",
        action: "update",
        label: "Sửa thông tin người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 30,
    },
    [PERMISSIONS.USER_DELETE]: {
        key: PERMISSIONS.USER_DELETE,
        resource: "user",
        action: "delete",
        label: "Xóa người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 40,
    },
    [PERMISSIONS.USER_CHANGE_STATUS]: {
        key: PERMISSIONS.USER_CHANGE_STATUS,
        resource: "user",
        action: "status",
        label: "Bật / tắt trạng thái người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 50,
    },
    [PERMISSIONS.USER_BULK_STATUS]: {
        key: PERMISSIONS.USER_BULK_STATUS,
        resource: "user",
        action: "bulk_status",
        label: "Cập nhật trạng thái hàng loạt người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 60,
    },
    [PERMISSIONS.USER_BULK_DELETE]: {
        key: PERMISSIONS.USER_BULK_DELETE,
        resource: "user",
        action: "bulk_delete",
        label: "Xóa hàng loạt người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 70,
    },
    [PERMISSIONS.USER_UPLOAD_AVATAR]: {
        key: PERMISSIONS.USER_UPLOAD_AVATAR,
        resource: "user",
        action: "upload_avatar",
        label: "Cập nhật ảnh đại diện người dùng",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 80,
    },
    [PERMISSIONS.USER_SET_ROLES]: {
        key: PERMISSIONS.USER_SET_ROLES,
        resource: "user",
        action: "set_roles",
        label: "Gán role cho user",
        groupKey: PERMISSION_GROUPS.USERS.key,
        groupLabel: PERMISSION_GROUPS.USERS.label,
        order: 85,
    },


    // ===== CATEGORIES =====
    [PERMISSIONS.CATEGORY_READ]: {
        key: PERMISSIONS.CATEGORY_READ,
        resource: "category",
        action: "read",
        label: "Xem danh mục",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 110,
    },
    [PERMISSIONS.CATEGORY_CREATE]: {
        key: PERMISSIONS.CATEGORY_CREATE,
        resource: "category",
        action: "create",
        label: "Thêm danh mục",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 120,
    },
    [PERMISSIONS.CATEGORY_UPDATE]: {
        key: PERMISSIONS.CATEGORY_UPDATE,
        resource: "category",
        action: "update",
        label: "Sửa danh mục",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 130,
    },
    [PERMISSIONS.CATEGORY_DELETE]: {
        key: PERMISSIONS.CATEGORY_DELETE,
        resource: "category",
        action: "delete",
        label: "Xóa danh mục",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 140,
    },
    [PERMISSIONS.CATEGORY_CHANGE_STATUS]: {
        key: PERMISSIONS.CATEGORY_CHANGE_STATUS,
        resource: "category",
        action: "status",
        label: "Bật / tắt trạng thái danh mục",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 150,
    },

    // ===== PRODUCTS =====
    [PERMISSIONS.PRODUCT_READ]: {
        key: PERMISSIONS.PRODUCT_READ,
        resource: "product",
        action: "read",
        label: "Xem sản phẩm",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 210,
    },
    [PERMISSIONS.PRODUCT_CREATE]: {
        key: PERMISSIONS.PRODUCT_CREATE,
        resource: "product",
        action: "create",
        label: "Thêm sản phẩm",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 220,
    },
    [PERMISSIONS.PRODUCT_UPDATE]: {
        key: PERMISSIONS.PRODUCT_UPDATE,
        resource: "product",
        action: "update",
        label: "Sửa sản phẩm",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 230,
    },
    [PERMISSIONS.PRODUCT_DELETE]: {
        key: PERMISSIONS.PRODUCT_DELETE,
        resource: "product",
        action: "delete",
        label: "Xóa sản phẩm",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 240,
    },
    [PERMISSIONS.PRODUCT_CHANGE_STATUS]: {
        key: PERMISSIONS.PRODUCT_CHANGE_STATUS,
        resource: "product",
        action: "status",
        label: "Bật / tắt trạng thái sản phẩm",
        groupKey: PERMISSION_GROUPS.CATALOG.key,
        groupLabel: PERMISSION_GROUPS.CATALOG.label,
        order: 250,
    },

    // ===== ORDERS =====
    [PERMISSIONS.ORDER_READ]: {
        key: PERMISSIONS.ORDER_READ,
        resource: "order",
        action: "read",
        label: "Xem đơn hàng",
        groupKey: PERMISSION_GROUPS.ORDERS.key,
        groupLabel: PERMISSION_GROUPS.ORDERS.label,
        order: 310,
    },
    [PERMISSIONS.ORDER_CREATE]: {
        key: PERMISSIONS.ORDER_CREATE,
        resource: "order",
        action: "create",
        label: "Tạo đơn hàng",
        groupKey: PERMISSION_GROUPS.ORDERS.key,
        groupLabel: PERMISSION_GROUPS.ORDERS.label,
        order: 320,
    },
    [PERMISSIONS.ORDER_UPDATE]: {
        key: PERMISSIONS.ORDER_UPDATE,
        resource: "order",
        action: "update",
        label: "Sửa đơn hàng",
        groupKey: PERMISSION_GROUPS.ORDERS.key,
        groupLabel: PERMISSION_GROUPS.ORDERS.label,
        order: 330,
    },
    [PERMISSIONS.ORDER_DELETE]: {
        key: PERMISSIONS.ORDER_DELETE,
        resource: "order",
        action: "delete",
        label: "Xóa đơn hàng",
        groupKey: PERMISSION_GROUPS.ORDERS.key,
        groupLabel: PERMISSION_GROUPS.ORDERS.label,
        order: 340,
    },
    [PERMISSIONS.ORDER_UPDATE_STATUS]: {
        key: PERMISSIONS.ORDER_UPDATE_STATUS,
        resource: "order",
        action: "status",
        label: "Cập nhật trạng thái đơn hàng",
        groupKey: PERMISSION_GROUPS.ORDERS.key,
        groupLabel: PERMISSION_GROUPS.ORDERS.label,
        order: 350,
    },

    // ===== RBAC / SYSTEM =====
    [PERMISSIONS.RBAC_READ]: {
        key: PERMISSIONS.RBAC_READ,
        resource: "rbac",
        action: "read",
        label: "Xem module phân quyền (RBAC)",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 900,
    },

    [PERMISSIONS.RBAC_CREATE_ROLE]: {
        key: PERMISSIONS.RBAC_CREATE_ROLE,
        resource: "rbac",
        action: "role_create",
        label: "Tạo role",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 910,
    },
    [PERMISSIONS.RBAC_UPDATE_ROLE]: {
        key: PERMISSIONS.RBAC_UPDATE_ROLE,
        resource: "rbac",
        action: "role_update",
        label: "Sửa role",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 920,
    },
    [PERMISSIONS.RBAC_DELETE_ROLE]: {
        key: PERMISSIONS.RBAC_DELETE_ROLE,
        resource: "rbac",
        action: "role_delete",
        label: "Xóa role",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 930,
    },


    [PERMISSIONS.RBAC_SET_ROLE_PERMISSIONS]: {
        key: PERMISSIONS.RBAC_SET_ROLE_PERMISSIONS,
        resource: "rbac",
        action: "set_role_permissions",
        label: "Gán permissions cho role",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 980,
    },
    [PERMISSIONS.RBAC_SET_USER_ROLES]: {
        key: PERMISSIONS.RBAC_SET_USER_ROLES,
        resource: "rbac",
        action: "set_user_roles",
        label: "Gán roles cho user",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 981,
    },
    [PERMISSIONS.RBAC_SET_USER_OVERRIDE]: {
        key: PERMISSIONS.RBAC_SET_USER_OVERRIDE,
        resource: "rbac",
        action: "set_user_override",
        label: "Gán quyền override cho user",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 982,
    },
    [PERMISSIONS.RBAC_REMOVE_USER_OVERRIDE]: {
        key: PERMISSIONS.RBAC_REMOVE_USER_OVERRIDE,
        resource: "rbac",
        action: "remove_user_override",
        label: "Gỡ quyền override của user",
        groupKey: PERMISSION_GROUPS.SYSTEM.key,
        groupLabel: PERMISSION_GROUPS.SYSTEM.label,
        order: 983,
    },


});

// list để dễ seed
const PERMISSION_META_LIST = Object.freeze(Object.values(PERMISSION_META));

// =====================================================
// 3) ADMIN_SCREENS: giữ nguyên structure, map action -> permission
// =====================================================
const ADMIN_SCREENS = Object.freeze({
    USERS: {
        key: "user",
        group: PERMISSION_GROUPS.USERS.key,
        label: "Người dùng",
        icon: "users",
        order: 10,
        routes: [
            "/admin/user", // GET list, POST create (tuỳ bạn tách route)
            "/admin/user/:id", // GET detail / PATCH update / DELETE delete
            "/admin/user/:id/status",
            "/admin/user/bulk/status",
            "/admin/user/bulk/delete",
            "/admin/user/me/avatar",
        ],
        accessAny: [
            PERMISSIONS.USER_READ,
            PERMISSIONS.USER_CREATE,
            PERMISSIONS.USER_UPDATE,
            PERMISSIONS.USER_DELETE,
            PERMISSIONS.USER_CHANGE_STATUS,
            PERMISSIONS.USER_BULK_STATUS,
            PERMISSIONS.USER_BULK_DELETE,
            PERMISSIONS.USER_UPLOAD_AVATAR,
        ],
        actions: {
            view: [PERMISSIONS.USER_READ],
            create: [PERMISSIONS.USER_CREATE],
            update: [PERMISSIONS.USER_UPDATE],
            delete: [PERMISSIONS.USER_DELETE],
            changeStatus: [PERMISSIONS.USER_CHANGE_STATUS],
            bulkStatus: [PERMISSIONS.USER_BULK_STATUS],
            bulkDelete: [PERMISSIONS.USER_BULK_DELETE],
            uploadAvatar: [PERMISSIONS.USER_UPLOAD_AVATAR],
            setRoles: [PERMISSIONS.USER_SET_ROLES],
        },
    },

    CATEGORIES: {
        key: "category",
        group: PERMISSION_GROUPS.CATALOG.key,
        label: "Danh mục",
        icon: "tags",
        order: 20,
        routes: [
            "/admin/category",
            "/admin/category/:id",
            "/admin/category/create",
            "/admin/category/:id/status",
        ],
        accessAny: [
            PERMISSIONS.CATEGORY_READ,
            PERMISSIONS.CATEGORY_CREATE,
            PERMISSIONS.CATEGORY_UPDATE,
            PERMISSIONS.CATEGORY_DELETE,
            PERMISSIONS.CATEGORY_CHANGE_STATUS,
        ],
        actions: {
            view: [PERMISSIONS.CATEGORY_READ],
            create: [PERMISSIONS.CATEGORY_CREATE],
            update: [PERMISSIONS.CATEGORY_UPDATE],
            delete: [PERMISSIONS.CATEGORY_DELETE],
            changeStatus: [PERMISSIONS.CATEGORY_CHANGE_STATUS],
        },
    },

    PRODUCTS: {
        key: "product",
        group: PERMISSION_GROUPS.CATALOG.key,
        label: "Sản phẩm",
        icon: "package",
        order: 30,
        routes: [
            "/admin/product", // GET / POST
            "/admin/product/:id", // GET
            "/admin/product/update/:id", // PATCH
            "/admin/product/delete/:id", // DELETE
            "/admin/product/:id/status", // PATCH
        ],
        accessAny: [
            PERMISSIONS.PRODUCT_READ,
            PERMISSIONS.PRODUCT_CREATE,
            PERMISSIONS.PRODUCT_UPDATE,
            PERMISSIONS.PRODUCT_DELETE,
            PERMISSIONS.PRODUCT_CHANGE_STATUS,
        ],
        actions: {
            view: [PERMISSIONS.PRODUCT_READ],
            create: [PERMISSIONS.PRODUCT_CREATE],
            update: [PERMISSIONS.PRODUCT_UPDATE],
            delete: [PERMISSIONS.PRODUCT_DELETE],
            changeStatus: [PERMISSIONS.PRODUCT_CHANGE_STATUS],
        },
    },

    ORDERS: {
        key: "order",
        group: PERMISSION_GROUPS.ORDERS.key,
        label: "Đơn hàng",
        icon: "receipt",
        order: 40,
        routes: [
            "/admin/order",
            "/admin/order/:id",
            "/admin/order/:id/status",
        ],
        accessAny: [
            PERMISSIONS.ORDER_READ,
            PERMISSIONS.ORDER_CREATE,
            PERMISSIONS.ORDER_UPDATE,
            PERMISSIONS.ORDER_DELETE,
            PERMISSIONS.ORDER_UPDATE_STATUS,
        ],
        actions: {
            view: [PERMISSIONS.ORDER_READ],
            create: [PERMISSIONS.ORDER_CREATE],
            update: [PERMISSIONS.ORDER_UPDATE],
            delete: [PERMISSIONS.ORDER_DELETE],
            changeStatus: [PERMISSIONS.ORDER_UPDATE_STATUS],
        },
    },

    RBAC: {
        key: "rbac",
        group: PERMISSION_GROUPS.SYSTEM.key,
        label: "Phân quyền",
        icon: "shield",
        order: 90,
        routes: [
            "/admin/rbac",
            "/admin/rbac/roles",
            "/admin/rbac/permissions",
            "/admin/rbac/sync-admin",
            "/admin/rbac/role-permissions",
            "/admin/rbac/user-roles",
            "/admin/rbac/user-override",
        ],
        accessAny: [
            PERMISSIONS.RBAC_READ,
            PERMISSIONS.RBAC_READ_PERMISSION,
            PERMISSIONS.RBAC_CREATE_ROLE,
            PERMISSIONS.RBAC_UPDATE_ROLE,
            PERMISSIONS.RBAC_DELETE_ROLE,
            PERMISSIONS.RBAC_CREATE_PERMISSION,
            PERMISSIONS.RBAC_UPDATE_PERMISSION,
            PERMISSIONS.RBAC_DELETE_PERMISSION,
            PERMISSIONS.RBAC_SET_ROLE_PERMISSIONS,
            PERMISSIONS.RBAC_SET_USER_ROLES,
            PERMISSIONS.RBAC_SET_USER_OVERRIDE,
            PERMISSIONS.RBAC_REMOVE_USER_OVERRIDE,
            PERMISSIONS.RBAC_SYNC_ADMIN,
        ],
        actions: {
            view: [PERMISSIONS.RBAC_READ],
            listPermissions: [PERMISSIONS.RBAC_READ_PERMISSION],

            createRole: [PERMISSIONS.RBAC_CREATE_ROLE],
            updateRole: [PERMISSIONS.RBAC_UPDATE_ROLE],
            deleteRole: [PERMISSIONS.RBAC_DELETE_ROLE],

            createPermission: [PERMISSIONS.RBAC_CREATE_PERMISSION],
            updatePermission: [PERMISSIONS.RBAC_UPDATE_PERMISSION],
            deletePermission: [PERMISSIONS.RBAC_DELETE_PERMISSION],

            setRolePermissions: [PERMISSIONS.RBAC_SET_ROLE_PERMISSIONS],
            setUserRoles: [PERMISSIONS.RBAC_SET_USER_ROLES],
            setUserOverride: [PERMISSIONS.RBAC_SET_USER_OVERRIDE],
            removeUserOverride: [PERMISSIONS.RBAC_REMOVE_USER_OVERRIDE],

            syncAdmin: [PERMISSIONS.RBAC_SYNC_ADMIN],
        },
    },
});

module.exports = {
    PERMISSIONS,
    PERMISSION_GROUPS,
    ADMIN_SCREENS,
    PERMISSION_META,
    PERMISSION_META_LIST,
};
