// utils/role.util.js

/**
 * Chuẩn hoá chuỗi để tạo code: bỏ dấu, upper, thay space bằng _
 */
function normalizeForCode(input = "") {
    let s = String(input).trim();

    // bỏ dấu tiếng Việt
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // giữ chữ/số, thay các ký tự khác thành khoảng trắng
    s = s.replace(/[^a-zA-Z0-9]+/g, " ").trim();

    // space => _
    s = s.replace(/\s+/g, "_");

    // upper
    s = s.toUpperCase();

    return s;
}

/**
 * Tạo roleCode từ name (VD: "Quản trị hệ thống" => "QUAN_TRI_HE_THONG")
 * Nếu rỗng thì fallback "ROLE_<timestamp>"
 */
function toRoleCode(name) {
    const code = normalizeForCode(name);
    if (code) return code;
    return `ROLE_${Date.now()}`;
}

/**
 * Derive type từ code.
 * Tuỳ hệ thống của bạn có enum: ["owner","manager","staff","shipper","user"]
 *
 * Quy tắc gợi ý:
 * - Nếu code có chứa ADMIN/OWNER/SUPER => owner
 * - MANAGER => manager
 * - SHIPPER/DELIVERY => shipper
 * - STAFF/EMPLOYEE => staff
 * - còn lại => user
 *
 * Bạn sửa mapping theo nghiệp vụ.
 */
function deriveTypeFromCode(code = "") {
    const c = String(code).trim().toUpperCase();

    // mạnh nhất
    if (/(SUPER|OWNER|ADMIN|ROOT)/.test(c)) return "owner";
    if (/MANAGER/.test(c)) return "manager";
    if (/(SHIPPER|DELIVERY)/.test(c)) return "shipper";
    if (/(STAFF|EMPLOYEE)/.test(c)) return "staff";

    return "user";
}

/**
 * Derive priority từ type (cao hơn = quyền mạnh hơn)
 * Bạn có thể đổi số theo ý.
 */
function derivePriorityFromType(type = "user") {
    const t = String(type).trim().toLowerCase();
    const map = {
        owner: 100,
        manager: 80,
        staff: 50,
        shipper: 40,
        user: 10,
    };
    return map[t] ?? 10;
}

module.exports = {
    toRoleCode,
    deriveTypeFromCode,
    derivePriorityFromType,
};
