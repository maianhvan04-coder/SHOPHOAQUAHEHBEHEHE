const Category = require("./category.model");

exports.create = (payload) => Category.create(payload);

exports.findByIdAdmin = (id) => Category.findOne({ _id: id, isDeleted: false });
exports.findByIdPublic = (id) => Category.findOne({ _id: id, isDeleted: false, isActive: true });

exports.findAnyBySlug = (slug) => Category.findOne({ slug });

exports.updateById = (id, payload) =>
    Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: payload },
        { new: true }
    );

exports.softDeleteById = (id) =>
    Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
    );

// list admin: thấy cả active/inactive (nhưng không thấy deleted)
exports.listAdmin = async ({ page, limit, search, isActive }) => {
    const filter = { isDeleted: false };

    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;
    const items = await Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Category.countDocuments(filter);
    return { items, total };
};

// list public: chỉ active + not deleted
exports.listPublic = async ({ page, limit, search }) => {
    const filter = { isDeleted: false, isActive: true };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;
    const items = await Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Category.countDocuments(filter);
    return { items, total };
};
