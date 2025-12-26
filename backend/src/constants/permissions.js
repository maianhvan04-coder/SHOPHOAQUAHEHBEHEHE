// permission key: "resource:action"
const PERMISSIONS = Object.freeze({
    // user
    USER_READ: "user:read",
    USER_WRITE: "user:write",

    // category
    CATEGORY_READ: "category:read",
    CATEGORY_WRITE: "category:write",

    // product
    PRODUCT_READ: "product:read",
    PRODUCT_WRITE: "product:write",

    // order
    ORDER_READ: "order:read",
    ORDER_WRITE: "order:write",
    ORDER_UPDATE_STATUS: "order:status",
});

// ===== UI Catalog (metadata) =====

// Nhóm sidebar/menu
const PERMISSION_GROUPS = Object.freeze({
    USERS: { key: "USERS", label: "Người dùng", icon: "users", order: 10 },
    CATALOG: { key: "CATALOG", label: "Danh mục & Sản phẩm", icon: "box", order: 20 },
    ORDERS: { key: "ORDERS", label: "Đơn hàng", icon: "receipt", order: 30 },
    SYSTEM: { key: "SYSTEM", label: "Hệ thống", icon: "settings", order: 99 },
});

// Khai báo “screens” (màn hình/trang) cho admin
// screen biết: route nào, menuKey gì, cần permission nào để được vào
const ADMIN_SCREENS = Object.freeze({
    USERS: {
        key: "user",
        group: PERMISSION_GROUPS.USERS.key,
        label: "Người dùng  sssss",
        icon: "users",
        order: 10,
        routes: [
            "/admin/user",                 // GET /
            "/admin/user/:id",              // DELETE /:id
            "/admin/user/:id/status",       // PATCH /:id/status
            "/admin/user/bulk/status",      // PATCH /bulk/status
            "/admin/user/bulk/delete",      // PATCH /bulk/delete
            "/admin/user/me/avatar",        // PATCH /me/avatar
        ],
        accessAny: [PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE],
        actions: {
            view: [PERMISSIONS.USER_READ],
            update: [PERMISSIONS.USER_WRITE],
            delete: [PERMISSIONS.USER_WRITE],
            bulkStatus: [PERMISSIONS.USER_WRITE],
            bulkDelete: [PERMISSIONS.USER_WRITE],
            uploadAvatar: [PERMISSIONS.USER_WRITE],
        },
    },

    CATEGORIES: {
        key: "category",
        group: PERMISSION_GROUPS.CATALOG.key,
        label: "Danh mục",
        icon: "tags",
        order: 20,
        routes: [
            "/admin/category",              // GET /
            "/admin/category/:id",          // GET /:id, PATCH /:id, DELETE /:id
            "/admin/category/create",       // POST /create
            "/admin/category/:id/status",   // PATCH /:id/status
        ],
        accessAny: [PERMISSIONS.CATEGORY_READ, PERMISSIONS.CATEGORY_WRITE],
        actions: {
            view: [PERMISSIONS.CATEGORY_READ],
            create: [PERMISSIONS.CATEGORY_WRITE],
            update: [PERMISSIONS.CATEGORY_WRITE],
            delete: [PERMISSIONS.CATEGORY_WRITE],
            changeStatus: [PERMISSIONS.CATEGORY_WRITE],
        },
    },

    PRODUCTS: {
        key: "product",
        group: PERMISSION_GROUPS.CATALOG.key,
        label: "Sản phẩm",
        icon: "package",
        order: 30,
        routes: [
            "/admin/product",               // GET / , POST /
            "/admin/product/:id",           // GET /:id
            "/admin/product/update/:id",    // PATCH /update/:id
            "/admin/product/delete/:id",    // DELETE /delete/:id
            "/admin/product/:id/status",    // PATCH /:id/status
        ],
        accessAny: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_WRITE],
        actions: {
            view: [PERMISSIONS.PRODUCT_READ],
            create: [PERMISSIONS.PRODUCT_WRITE],
            update: [PERMISSIONS.PRODUCT_WRITE],
            delete: [PERMISSIONS.PRODUCT_WRITE],
            changeStatus: [PERMISSIONS.PRODUCT_WRITE],
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
        // tạm dùng USER_WRITE, sau này bạn có thể tạo RBAC_* riêng
        accessAny: [PERMISSIONS.USER_WRITE],
        actions: {
            view: [PERMISSIONS.USER_READ],
            update: [PERMISSIONS.USER_WRITE],
            create: [PERMISSIONS.USER_WRITE],
            delete: [PERMISSIONS.USER_WRITE],
        },
    },
});


// Bảng mô tả permission (dùng cho admin UI “phân quyền” / audit)
const PERMISSION_META = Object.freeze({
    [PERMISSIONS.USER_READ]: { key: PERMISSIONS.USER_READ, resource: "user", action: "read", label: "Xem người dùng", group: PERMISSION_GROUPS.USERS.key },
    [PERMISSIONS.USER_WRITE]: { key: PERMISSIONS.USER_WRITE, resource: "user", action: "write", label: "Quản lý người dùng", group: PERMISSION_GROUPS.USERS.key },

    [PERMISSIONS.CATEGORY_READ]: { key: PERMISSIONS.CATEGORY_READ, resource: "category", action: "read", label: "Xem danh mục", group: PERMISSION_GROUPS.CATALOG.key },
    [PERMISSIONS.CATEGORY_WRITE]: { key: PERMISSIONS.CATEGORY_WRITE, resource: "category", action: "write", label: "Quản lý danh mục", group: PERMISSION_GROUPS.CATALOG.key },

    [PERMISSIONS.PRODUCT_READ]: { key: PERMISSIONS.PRODUCT_READ, resource: "product", action: "read", label: "Xem sản phẩm", group: PERMISSION_GROUPS.CATALOG.key },
    [PERMISSIONS.PRODUCT_WRITE]: { key: PERMISSIONS.PRODUCT_WRITE, resource: "product", action: "write", label: "Quản lý sản phẩm", group: PERMISSION_GROUPS.CATALOG.key },

    [PERMISSIONS.ORDER_READ]: { key: PERMISSIONS.ORDER_READ, resource: "order", action: "read", label: "Xem đơn hàng", group: PERMISSION_GROUPS.ORDERS.key },
    [PERMISSIONS.ORDER_WRITE]: { key: PERMISSIONS.ORDER_WRITE, resource: "order", action: "write", label: "Quản lý đơn hàng", group: PERMISSION_GROUPS.ORDERS.key },
    [PERMISSIONS.ORDER_UPDATE_STATUS]: { key: PERMISSIONS.ORDER_UPDATE_STATUS, resource: "order", action: "status", label: "Cập nhật trạng thái đơn", group: PERMISSION_GROUPS.ORDERS.key },
});

module.exports = { PERMISSIONS, PERMISSION_GROUPS, ADMIN_SCREENS, PERMISSION_META };
