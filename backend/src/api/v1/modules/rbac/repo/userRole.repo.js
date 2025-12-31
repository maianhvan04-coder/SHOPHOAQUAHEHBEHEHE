// repositories/userRole.repo.js
const UserRole = require("../model/UserRole.model");

exports.restoreManyByUserIds = (userIds, opts = {}) => {
    // restore tất cả quan hệ role của các user đó
    const update = {
        $set: {
            isDeleted: false,
            isActive: true,
        },
    };

    return UserRole.updateMany(
        { userId: { $in: userIds } },
        update,
        { session: opts.session }
    );
};

exports.restoreManyByUserIdsAndRoleIds = (userIds, roleIds, opts = {}) => {
    const update = {
        $set: {
            isDeleted: false,
            isActive: true,
        },
    };

    return UserRole.updateMany(
        { userId: { $in: userIds }, roleId: { $in: roleIds } },
        update,
        { session: opts.session }
    );
};
