const { ROLLBACK_POLICY } = require("./audit.policy");
const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");



exports.buildRollbackPayload = ({ audit, user }) => {
    if (!audit?.resource) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Audit không hợp lệ");
    }

    const policy = ROLLBACK_POLICY[audit.resource];
    if (!policy) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Resource không hỗ trợ rollback"
        );
    }

    // 1️⃣ Check action có được rollback không
    if (!policy.allowedActions.includes(audit.action)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Action này không được rollback"
        );
    }

    // 2️⃣ Snapshot trước khi thay đổi
    const before = audit.changes?.before;
    if (!before || typeof before !== "object") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Không có snapshot trước để rollback"
        );
    }

    const payload = {};

    // 3️⃣ Duyệt từng field cho phép rollback
    for (const field of policy.allowedFields) {
        // bỏ nếu snapshot không có field
        if (before[field] === undefined) continue;

        // 🔐 admin-only field
        if (
            policy.adminOnlyFields?.includes(field) &&
            !user?.roles?.includes("ADMIN")
        ) {
            continue;
        }

        payload[field] = before[field];
    }

    // 4️⃣ Không có gì để rollback
    if (!Object.keys(payload).length) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Không có field hợp lệ để rollback"
        );
    }

    return payload;
};

