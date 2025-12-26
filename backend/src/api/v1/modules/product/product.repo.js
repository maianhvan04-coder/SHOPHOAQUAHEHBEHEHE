const Product = require("./product.model")

exports.listAdminProduct = async ({ page, limit, filter, sort }) => {
    const skip = (page - 1) * limit;
    const items = await Product.find(filter)
        .populate("categoryId")
        .sort(sort)
        .skip(skip)
        .limit(limit)


    const total = await Product.countDocuments(filter);
    return { items, total }
}

exports.create = async (payload) => Product.create(payload)


exports.findAnyByIdSlug = (slug) => Product.findOne({ slug });

exports.updateById = (id, payload) => Product.findOneAndUpdate({ _id: id, isDeleted: false }, {
    $set: payload

}, { new: true })

exports.findByIdAdmin = (id) => Product.findById({ _id: id })

exports.softDeleteById = (id) =>
    Product.findOneAndUpdate(
        { _id: id, isDeleted: false }, {
        $set: { isDeleted: true, isActive: false }
    },
        { new: true }

    )