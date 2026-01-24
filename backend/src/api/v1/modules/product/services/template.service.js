const mongoose = require("mongoose")
const ApiError = require("../../../../../core/ApiError");
const httpStatus = require("../../../../../core/httpStatus");
const templateRepo = require("../repositories/template.repository");
const checkId = require("../../../../../utils/checkId");
const {
    parsePagination,
    parseBoolean,
} = require("../../../../../helpers/query.util.js.js");

exports.listTemplateAdmin = async (query, userId, req) => {
    checkId(userId, "Người dùng");
    const { permissions } = req.user;
    // console.log(req.user)
    const authz = permissions["template:read"];
    const { limit, page } = parsePagination(query);
    const { isDeleted } = query;
    const search = query.search?.trim();

    let isActive = parseBoolean(query.isActive);
    if (!authz) {
        throw new ApiError(httpStatus.FORBIDDEN, "Không có quyền xem sản phẩm");
    }
    if (isActive === "true") isActive = true;
    else if (isActive === "false") isActive = false;
    else isActive = undefined;

    const filter = { isDeleted };

    if (authz.scope === "own") {
        filter.createdBy = user.sub;
    }
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search) {
        filter.$or = [
            { type: { $regex: search, $options: "i" } },
        ];
    }

    const { items, total } = await templateRepo.findAdminList(page, limit, filter)
    return { items, total }

}


exports.createTemplate = async (payload, userId) => {
    const { title, intro, sections, type } = payload;

    // validate business
    checkId(userId, "Người dùng");

    const existed = await templateRepo.existsByType(type);
    if (existed) {
        throw new ApiError(
            httpStatus.CONFLICT,
            "Template với type này đã tồn tại"
        );
    }

    return templateRepo.createTemplate({
        type,
        versionCounter: 1,
        versions: [
            {
                version: 1,
                title,
                intro,
                sections,
                createdBy: userId,
                isDeleted: false,
            },
        ],
        activeVersion: 1,
    });
};

exports.createVersion = async (type, payload, userId) => {

    checkId(userId, "Người dùng");
    const { title, intro, sections } = payload;

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const template = await templateRepo.existsByType(type, session);

        if (!template) {
            throw new ApiError(
                httpStatus.NOT_FOUND,
                "Không tìm thấy template với type này"
            );
        }



        const updated = await templateRepo.addVersion(
            type,
            {
                title,
                intro,
                sections,
                createdBy: userId
            },
            { session }
        )
        console.log(updated)
        await session.commitTransaction()

        return updated
    } catch (error) {

        await session.abortTransaction()
        throw error;
    } finally {
        session.endSession()
    }
}

exports.updateVersion = async (type, version, payload, userId) => {
    checkId(userId, "Người dùng")
    const { title, intro, sections } = payload;
    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        const template = await templateRepo.existsByType(type, session);
        if (!template) {
            throw new ApiError(httpStatus.NOT_FOUND, "Template không tồn tại");
        }

        if (template.activeVersion === version) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Không thể chỉnh sửa version đang active"
            );
        }

        const updated = await templateRepo.updateVersionContent(
            type, version,
            {
                title,
                intro,
                sections,
                updatedBy: userId
            },
            { session }
        )

        if (!updated) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Version không tồn tại");
        }

        await session.commitTransaction()
        return updated

    } catch (error) {
        await session.abortTransaction()
        throw error

    } finally {
        session.endSession();
    }

}


exports.getTemplateVersion = async (type, version) => {
    const result =
        await templateRepo.findVersionByTypeAndVersion(type, version);

    if (!result || !result.version) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Template version không tồn tại"
        );
    }

    return {
        type: result.type,
        activeVersion: result.activeVersion,
        version: result.version,
    };
};

exports.activateVersion = async ({ type, version }) => {
    const versionNav = parseInt(version, 10);
    if (Number.isNaN(version)) {
        throw new ApiError("version không hợp lệ");
    }

    return await templateRepo.activateVersion(type, versionNav);

}
exports.getTemplate = async ({ type }) => {
    return templateRepo.findAdminDetail(type);
};

exports.getAllTemplates = async () => {
    return templateRepo.getAllTemplates();
}