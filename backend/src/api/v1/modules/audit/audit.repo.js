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
    limit = 20,
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
