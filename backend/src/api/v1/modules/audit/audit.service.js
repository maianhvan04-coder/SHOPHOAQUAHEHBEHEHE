const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");

const auditRepo = require("./audit.repo");
const AuditLog = require("./audit.model"); // 🔥 THIẾU DÒNG NÀY
const productRepo = require("../product/product.repo");
const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");
const {
    parsePagination,
    parseBoolean,
} = require("../../../../helpers/query.util.js.js");
/**
 * Ghi audit log
 * @param {Object} payload
 */
exports.logAudit = async ({
    actorId,
    actorRoles = [],
    resource,
    action,
    resourceId,
    changes = {},
    req,
}) => {
    if (!actorId || !resource || !action || !resourceId) return;
    const rawUA = req?.headers?.["user-agent"];
    const parser = new UAParser(rawUA);
    const ua = parser.getResult();
    try {
        await AuditLog.create({
            actorId,
            actorRoles,
            resource,
            action,
            resourceId,
            changes,
            ip: req?.ip,
            // structured (dễ đọc)
            userAgent: {
                browser: {
                    name: ua.browser.name,
                    version: ua.browser.version,
                },
                os: {
                    name: ua.os.name,
                    version: ua.os.version,
                },
                device: {
                    type: ua.device.type || "desktop",
                    vendor: ua.device.vendor,
                    model: ua.device.model,
                },
                engine: {
                    name: ua.engine.name,
                    version: ua.engine.version,
                },
            },
        });
    } catch (err) {
        // audit không được làm sập request chính
        console.error("AUDIT_LOG_ERROR:", err);
    }
};
exports.getProductAudit = async ({ resource, resourceId }) => {
    return auditRepo.findById({
        resource,
        resourceId,
    });
};


exports.getProductHistory = async ({ productId, user, query }) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "productId không hợp lệ");
    }

    const product = await productRepo
        .findByIdAdmin(productId)
        .select("_id name createdBy")
        .lean();

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
    }

    // RBAC product:read
    const authz = user.permissions?.["product:read"];
    if (!authz) {
        throw new ApiError(httpStatus.FORBIDDEN, "Không có quyền xem sản phẩm");
    }

    if (authz.scope === "own") {
        if (String(product.createdBy) !== String(user.sub)) {
            throw new ApiError(httpStatus.FORBIDDEN, "Không có quyền xem lịch sử sản phẩm này");
        }
    }

    const { page, limit, skip } = parsePagination(query);

    const filter = {
        resource: "product",
        resourceId: product._id,
    };

    const [items, total] = await Promise.all([
        auditRepo.find({ filter, skip, limit }),
        auditRepo.count({ filter }),
    ]);

    return {
        product,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        items,
    };
};


exports.getProductAuditList = async ({ user, query }) => {
    const limit = Math.min(Number(query.limit || 20), 50);
    const { productId, action, actorId, before } = query;

    const isAdmin =
        user.roles?.includes("ADMIN") ||
        user.roles?.includes("MANAGER");

    const filter = {
        resource: "product",
    };

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        filter.resourceId = productId;
    }

    if (action) {
        filter.action = action;
    }

    if (actorId && mongoose.Types.ObjectId.isValid(actorId)) {
        filter.actorId = actorId;
    }

    // ⏱ load theo thời gian (Chrome style)
    if (before) {
        const beforeDate = new Date(before);
        if (!isNaN(beforeDate)) {
            filter.createdAt = { $lt: beforeDate };
        }
    }

    // STAFF chỉ xem sản phẩm của mình
    if (!isAdmin) {
        if (!mongoose.Types.ObjectId.isValid(user.sub)) {
            throw new ApiError(400, "UserId không hợp lệ");
        }

        const myProducts = await productRepo.findByCreatedBy(
            user.sub
        );

        filter.resourceId = {
            $in: myProducts.map((p) => p._id),
        };
    }

    const items = await auditRepo.find({
        filter,
        limit,
    });

    const nextCursor =
        items.length > 0
            ? items[items.length - 1].createdAt
            : null;

    return {
        items,
        nextCursor, // 🔥 FE dùng để load tiếp
    };
};


exports.getProductAuditDetail = async ({
    auditId,
    userId,
    roles,
    permissions,
}) => {
    if (!mongoose.Types.ObjectId.isValid(auditId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "auditId không hợp lệ");
    }

    const audit = await auditRepo.findProductAuditById(auditId);
    if (!audit) {
        throw new ApiError(httpStatus.NOT_FOUND, "Audit không tồn tại");
    }

    if (audit.resource !== "product") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Audit không phải product");
    }

    // =====================
    // 🔐 RBAC
    // =====================
    const canReadAudit = permissions?.["audit:product:read"];
    if (!canReadAudit) {
        throw new ApiError(httpStatus.FORBIDDEN, "Không có quyền xem audit");
    }

    const isAdmin =
        roles.includes("ADMIN") || roles.includes("MANAGER");

    // STAFF: chỉ xem audit của sản phẩm do mình tạo
    if (!isAdmin && canReadAudit.scope === "own") {
        const createdBy =
            audit?.changes?.after?.createdBy ||
            audit?.changes?.before?.createdBy;

        if (String(createdBy) !== String(userId)) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                "Chỉ được xem audit sản phẩm của mình"
            );
        }
    }

    return audit;
};

