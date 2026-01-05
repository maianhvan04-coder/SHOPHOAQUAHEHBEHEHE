const Product = require("./product.model");

exports.listAdminProduct = async ({ page, limit, filter, sort }) => {
    const skip = (page - 1) * limit;

    const items = await Product.find(filter)
        .populate("category", "name slug") // ✅ đúng schema
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);
    return { items, total };
};

exports.create = (payload) => Product.create(payload);

exports.findAnyByIdSlug = (slug) => Product.findOne({ slug });

exports.findByIdAdmin = (id) => Product.findById(id).populate("category", "name slug");

exports.updateById = (id, payload) =>
    Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: payload },
        { new: true }
    ).populate("category", "name slug");

exports.softDeleteById = (id) =>
    Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
    );
