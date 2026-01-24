
const Template = require("../models/product.description.template.model");

exports.existsByType = async (type) => {
    return Template.exists({ type })

};
exports.getByType = (type, options = {}) =>
    Template.findOne({ type })
        .session(options.session || null);

exports.createTemplate = async (payload) => Template.create(payload)


exports.addVersion = async (type, versionPayload, options = {}) => {
    const result = await Template.findOneAndUpdate(
        { type },
        { $inc: { versionCounter: 1 } },
        {
            new: true,
            session: options.session
        }
    )

    if (!result) return null;

    const versionData = {
        ...versionPayload,
        version: result.versionCounter,
    }

    return Template.findOneAndUpdate(
        { type },
        {
            $push: { versions: versionData },
            $set: { updatedAt: new Date() },
        },
        {
            new: true,
            session: options.session
        }
    )
}

exports.activateVersion = async (type, version) => {

    return Template.findOneAndUpdate(
        { type, "versions.version": version },
        { activeVersion: version },
        { new: true }
    )
}


/**
 * Danh sách template cho ADMIN
 * (KHÔNG lấy versions)
 */
exports.findAdminList = async ({ page, limit, filter }) => {
    const skip = (page - 1) * limit;
    const items = await Template.find(
        { filter },
        {
            type: 1,
            activeVersion: 1,
            versionCounter: 1,
            isActive: 1,
            updatedAt: 1,
        }
    )
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await Template.countDocuments(filter)
    return { items, total }
}

exports.updateVersionContent = async (type, version, payload, options = {}) => {

    return Template.findOneAndUpdate(
        {
            type,
            "versions.version": version,
            "versions.isDeleted": false,
        },
        {
            $set: {
                "versions.$.title": payload.title,
                "versions.$.intro": payload.intro,
                "versions.$.sections": payload.sections,
                "versions.$.updatedBy": payload.updatedBy,
                updatedAt: new Date(),
            }
        }
    )
}

exports.findAdminDetail = (type) =>
    Template.findOne(
        { type }).lean();

exports.findVersionByTypeAndVersion = async (type, version) => {
    const result = await Template.aggregate([
        {
            $match: {
                type,
                isActive: true,
            },
        },
        {
            $project: {
                type: 1,
                activeVersion: 1,
                version: {
                    $first: {
                        $filter: {
                            input: "$versions",
                            as: "v",
                            cond: {
                                $and: [
                                    { $eq: ["$$v.version", Number(version)] },
                                    { $ne: ["$$v.isDeleted", true] },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ]);

    return result[0] || null;
};

exports.getAllTemplates = () => Template.find({
    isActive: true
}).select("type activeVersion versions")
    .lean()