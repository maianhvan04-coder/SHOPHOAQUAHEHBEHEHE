const AuditLog = require("./audit.model")

exports.create = (doc) => AuditLog.create(doc)

exports.findById = ({ resource, resourceId }) => {
    return AuditLog.find({ resource, resourceId })
        .populate("actorId", "fullName email")

        .lean();
}
exports.findProductAuditById = (auditId) => {
    return AuditLog.findById(auditId)
        .populate("actorId", "fullName email image")

        .lean();
};

/**
 * Query audit logs
 */
exports.find = async ({
    filter,
    limit = 30,
}) => {
    return AuditLog.find(filter)
        .populate("actorId", "fullName email image")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

exports.count = async ({ filter }) => {
    return AuditLog.countDocuments(filter);
};


exports.findRecentLoginFailures = async ({ email, minutes }) => {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    return AuditLog.find({
        resource: "security",
        action: "login",
        "changes.meta.result": "login_failed",
        "changes.meta.email": email,
        createdAt: { $gte: since },
    });
};

exports.findSecurityAudit = async ({ filter, limit }) => {
    return AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("actorId", "_id fullName email")
        .lean();
};


exports.findLastLoginSuccess = async (userId) => {
    return AuditLog.findOne({
        resource: "security",
        action: "login_success",
        resourceId: userId,
    })
        .sort({ createdAt: -1 })
        .lean();
};

