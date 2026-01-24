const asyncHandler = require("../../../../core/asyncHandler");
const httpStatus = require("../../../../core/httpStatus");
const auditService = require("./audit.service");



exports.getProductAuditList = asyncHandler(async (req, res) => {
    const data = await auditService.getProductAuditList({
        user: {
            sub: req.user.sub,
            roles: req.user.roles,
        },
        query: req.query,
    });

    res.json(data);
});

exports.getProductHistory = asyncHandler(async (req, res) => {
    const data = await auditService.getProductHistory({
        productId: req.params.id,
        user: {
            sub: req.user.sub,
            permissions: req.user.permissions,
        },
        query: req.query,
    });
    console.log(data)
    res.json({ data: data });
})



exports.getProductAuditDetail = asyncHandler(async (req, res) => {
    const { auditId } = req.params;

    const user = req.user; // { sub, roles, permissions }

    const data = await auditService.getProductAuditDetail({
        auditId,
        userId: user.sub,
        roles: user.roles || [],
        permissions: user.permissions || {},
    });

    res.json({ data });
});

// audit.controller.js
exports.getSecurityAuditList = asyncHandler(async (req, res) => {
    const data = await auditService.getSecurityAuditList({
        user: {
            sub: req.user.sub,
            roles: req.user.roles,
        },
        query: req.query,
    });

    res.json(data);
});

// Rollback dữ liệu chung
exports.rollback = asyncHandler(async (req, res) => {
    const { resource, auditId } = req.params;

    const serviceMap = {
        product: productService,
        user: userService,
        order: orderService,
    };

    const resourceService = serviceMap[resource];
    if (!resourceService) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Resource không hợp lệ");
    }

    const data = await auditService.rollback({
        auditId,
        user: req.user,
        resourceService,
    });

    res.json({ message: "Rollback thành công", data });
});



