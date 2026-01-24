const Product = require("../models/product.model");

exports.listAdminProduct = async ({ page, limit, filter, sort }) => {
    const skip = (page - 1) * limit;

    const pipeline = [
        /* ================= MATCH ================= */
        { $match: filter },

        /* ================= INVENTORY (1–1) ================= */
        {
            $lookup: {
                from: "productinventories",
                localField: "_id",
                foreignField: "product",
                as: "inventory",
            },
        },
        {
            $unwind: {
                path: "$inventory",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ================= IMAGE (LẤY 1 ẢNH ĐẠI DIỆN) ================= */
        {
            $lookup: {
                from: "productimages",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product", "$$productId"] },
                        },
                    },
                    {
                        $sort: {
                            isPrimary: -1,
                            order: 1,
                            createdAt: 1,
                        },
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            _id: 1,
                            url: 1,
                            publicId: 1,
                        },
                    },
                ],
                as: "image",
            },
        },
        {
            $unwind: {
                path: "$image",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ================= CATEGORY ================= */
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ================= CREATOR ================= */
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
            },
        },
        {
            $unwind: {
                path: "$createdBy",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ================= SORT + PAGINATION ================= */
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },

        /* ================= PROJECTION (ADMIN LIST DTO) ================= */
        {
            $project: {
                name: 1,
                slug: 1,
                price: 1,
                isActive: 1,
                isFeatured: 1,
                featuredRank: 1,

                image: {
                    _id: "$image._id",
                    url: "$image.url",
                    publicId: "$image.publicId",
                },

                category: {
                    _id: "$category._id",
                    name: "$category.name",
                },

                createdBy: {
                    _id: "$createdBy._id",
                    fullName: "$createdBy.fullName",
                    email: "$createdBy.email",
                },

                inventory: {
                    stock: { $ifNull: ["$inventory.stock", 0] },
                    sold: { $ifNull: ["$inventory.sold", 0] },
                },
            },
        },
    ];

    const items = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(filter);

    return { items, total };
};



exports.findByCreatedBy = (createdBy) => Product.find(
    { createdBy },
    { _id: 1 }
).lean();

exports.create = async (data, session) => {
    const [doc] = await Product.create([data], { session });
    return doc;
};

exports.findAnyByIdSlug = (slug) => Product.findOne({ slug });

exports.findByIdAdmin = (id) => Product.findById(id).populate("category", "name slug");

exports.updateById = (id, payload, options = {}) =>
    Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: payload },
        {
            new: true,
            session: options.session
        }
    ).populate("category", "name slug");

exports.softDeleteById = (id) =>
    Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
    );

// Rollback dữ liệu
exports.rollbackById = async (id, payload, user) => {
    return Product.findByIdAndUpdate(
        id,
        payload,
        { new: true }
    );
};


exports.listClientProducts = async ({
    filter,
    sort,
    skip,
    limit,
}) => {
    const pipeline = [
        { $match: filter },

        /* ===== INVENTORY ===== */
        {
            $lookup: {
                from: "productinventories",
                localField: "_id",
                foreignField: "product",
                as: "inventory",
            },
        },
        {
            $unwind: {
                path: "$inventory",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ===== IMAGE (1 ảnh đại diện) ===== */
        {
            $lookup: {
                from: "productimages",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product", "$$productId"] },
                        },
                    },
                    {
                        $sort: {
                            isPrimary: -1,
                            order: 1,
                            createdAt: 1,
                        },
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            _id: 1,
                            url: 1,
                        },
                    },
                ],
                as: "image",
            },
        },
        {
            $unwind: {
                path: "$image",
                preserveNullAndEmptyArrays: true,
            },
        },

        /* ===== CATEGORY (ACTIVE ONLY) ===== */
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: false,
            },
        },
        {
            $match: {
                "category.isActive": true,
                "category.isDeleted": false,
            },
        },

        /* ===== SORT + PAGINATION ===== */
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },

        /* ===== CLIENT DTO ===== */
        {
            $project: {
                name: 1,
                slug: 1,
                price: 1,

                image: {
                    url: "$image.url",
                },

                category: {
                    name: "$category.name",
                    slug: "$category.slug",
                },

                inventory: {
                    stock: { $ifNull: ["$inventory.stock", 0] },
                    sold: { $ifNull: ["$inventory.sold", 0] },
                },
            },
        },
    ];

    const [items, total] = await Promise.all([
        Product.aggregate(pipeline),
        Product.countDocuments(filter),
    ]);

    return { items, total };
};

