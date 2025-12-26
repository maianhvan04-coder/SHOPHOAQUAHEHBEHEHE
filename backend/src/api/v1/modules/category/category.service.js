const mongoose = require("mongoose");
const { makeSlug } = require("../../../../helpers/makeSlug")

const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");
const categoryRepo = require("./category.repo");
const { parsePagination, parseBoolean } = require("../../../../helpers/query.util.js.js");

const Category = require("./category.model.js")



exports.create = async (payload = {}) => {

    const {
        name,
        description = "",
        isActive = true
    } = payload;

    if (!name) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Name là bắt buộc");
    }

    const slug = makeSlug(name);
    const existed = await categoryRepo.findAnyBySlug(slug);

    if (existed && !existed.isDeleted) {
        throw new ApiError(httpStatus.CONFLICT, "Category đã tồn tại");
    }

    if (existed && existed.isDeleted) {
        existed.name = name;
        existed.slug = slug;
        existed.description = description;
        existed.isActive = isActive;
        existed.isDeleted = false;
        await existed.save();
        return existed;
    }

    return categoryRepo.create({ name, slug, description, isActive });
};


exports.adminList = async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const search = query.search?.trim();

    let isActive = parseBoolean(query.isActive);
    if (isActive === "true") isActive = true;
    else if (isActive === "false") isActive = false;
    else isActive = undefined;

    const { items, total } = await categoryRepo.listAdmin({ page, limit, search, isActive });

    return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

exports.publicList = async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const search = query.search?.trim();

    const { items, total } = await categoryRepo.listPublic({ page, limit, search });

    return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

exports.adminGetById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");

    const cat = await categoryRepo.findByIdAdmin(id);
    if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
    return cat;
};

exports.publicGetById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");

    const cat = await categoryRepo.findByIdPublic(id);
    if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
    return cat;
};

exports.update = async (id, payload) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");

    const current = await categoryRepo.findByIdAdmin(id);
    if (!current) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");

    const updateData = { ...payload };
    const newSlug = "";
    if (payload.name && !payload.slug) {

        newSlug = makeSlug(payload.name);

        console.log(newSlug)
        const existed = await categoryRepo.findAnyBySlug(newSlug);
        if (existed && existed._id.toString() !== id && !existed.isDeleted) {
            throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
        }

        updateData.slug = newSlug;
    }
    updateData.slug = payload.slug;

    const updated = await categoryRepo.updateById(id, updateData);
    if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
    return updated;
};

exports.changeStatus = async (id, isActive) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");

    const updated = await categoryRepo.updateById(id, { isActive });
    if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
    return updated;
};

exports.softDelete = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");

    const deleted = await categoryRepo.softDeleteById(id);
    if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
    return deleted;
};



module.exports.getAllCategoriesService = async (
    search,
    sort,
    page,
    limit,
    extraFilter = {}
) => {
    try {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const query = {
            ...extraFilter,
            isDeleted: false,
        };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const sortMap = {
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            createdAt_asc: { createdAt: 1 },
            createdAt_desc: { createdAt: -1 },
        };

        const sortOptions = sortMap[sort] || { createdAt: -1 };

        const [categories, totalItems] = await Promise.all([
            Category.find(query)
                .select("-__v")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            Category.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalItems / limitNum);

        return {
            EC: 0,
            EM: "Lấy danh sách danh mục thành công",
            DT: {
                categories,
                totalItems,
                totalPages,
                page: pageNum,
                limit: limitNum,
            },
        };
    } catch (error) {
        console.error("getAllCategoriesService error:", error);
        return {
            EC: -1,
            EM: "Lỗi server khi lấy danh sách danh mục: " + error.message,
            DT: {
                categories: [],
                totalItems: 0,
                totalPages: 0,
            },
        };
    }
};


module.exports.getCategoryById = async (_id) => {
    try {
        const category = await Category.findOne({ _id }).select("-__v");
        return {
            EC: 0,
            EM: "Lấy danh mục thành công",
            DT: category,
        };
    } catch (error) {
        return {
            EC: -1,
            EM: "Lỗi server khi lấy danh mục danh mục" + error.message,
        };
    }
};