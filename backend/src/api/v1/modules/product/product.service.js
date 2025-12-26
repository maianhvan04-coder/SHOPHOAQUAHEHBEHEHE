const mongoose = require("mongoose");
const { makeSlug } = require("../../../../helpers/makeSlug")
const { parsePagination, parseBoolean } = require("../../../../helpers/query.util.js.js");
const { buildProductSort } = require("./product.sort");
const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");

const buildProductQuery = require("../../../../helpers/productQuery.js");
const productRepo = require("./product.repo");
const categoryRepo = require("../category/category.repo");
const parsePaging = require("../../../../helpers/query.util.js")
const Category = require("../category/category.model.js");
const Product = require("./product.model.js")

exports.productAdminCreate = async (payload) => {

    const { name, categoryId } = payload;
    // console.log(">> Name :", name, categoryId)

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {

        throw new ApiError(httpStatus.BAD_REQUEST, "Category khong hop le")
    }

    const category = await categoryRepo.findByIdAdmin(categoryId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category không tồn tại");
    }
    const slug = makeSlug(name);
    const existed = await productRepo.findAnyByIdSlug(slug)

    if (existed && !existed.isDeleted) {
        throw new ApiError(httpStatus.CONFLICT, "Sản phẩm đã tồn tại");
    }
    if (existed && existed.isDeleted) {
        const updated = await productRepo.updateById(existed._id, {
            ...payload,
            slug,
        })

        return updated;
    }

    return productRepo.create({ ...payload, slug })

}

exports.productAdminUpdate = async (id, payload) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(httpStatus.BAD_REQUEST, "ProductId không hợp lệ");
    console.log("id", id)
    const current = await productRepo.findByIdAdmin(id)

    if (!current) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Không tìm thấy sản phẩm");
    }

    if (payload.categoryId) {
        const resultId = await categoryRepo.findByIdAdmin(payload.categoryId)

        if (!resultId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Không tìm thấy danh mục sản phẩm");
        }
    }
    const updateData = { ...payload }

    if (payload.name) {
        const newSlug = await makeSlug(payload.name)
        const existed = await productRepo.findAnyByIdSlug(newSlug,);
        if (existed && existed._id.toString() !== id && !existed.isDeleted) {
            throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
        }

        updateData.slug = newSlug;
    }

    const updated = await productRepo.updateById(id, updateData)
    if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
    return updated;

}


exports.productAdminList = async (query) => {

    const { limit, page, skip } = parsePagination(query)

    const search = query.search?.trim();
    const categoryId = query.categoryId;
    let isActive = parseBoolean(query.isActive);

    if (isActive === "true") isActive = true;
    else if (isActive === "false") isActive = false;
    else isActive = undefined;

    const filter = { isDeleted: false }
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) filter.categoryId = categoryId;

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ]
    }


    const sort = buildProductSort(query.sort)

    const { items, total } = await productRepo.listAdminProduct({ page, limit, filter, sort });

    return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };



}


exports.softDelete = async (id) => {
    const deleted = await productRepo.softDeleteById(id);

}

exports.adminGetById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(httpStatus.BAD_REQUEST, "ProductId không hợp lệ");
    const result = await productRepo.findByIdAdmin(id)
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
    }
    return result;
}


module.exports.getAllProductsService = async (search, sort, page, limit, extraFilter = {}) => {
    try {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 15;
        const skip = (pageNum - 1) * limitNum;

        const { onlyActiveCategory, category, ...otherFilters } = extraFilter;
        let query = buildProductQuery({ search, ...otherFilters });

        // --- BƯỚC 1: Xử lý tìm ID từ Slug nếu có truyền category ---
        let categoryId = null;
        if (category && category !== "all") {
            const categoryDoc = await Category.findOne({ slug: category });
            if (!categoryDoc) {
                return {
                    EC: 0,
                    EM: "Không tìm thấy danh mục",
                    DT: { products: [], totalItems: 0 },
                };
            }
            categoryId = categoryDoc._id;
        }

        // --- BƯỚC 2: Xử lý logic lọc theo Only Active (Dành cho trang User) ---
        if (onlyActiveCategory) {
            // Lấy danh sách ID các category đang active
            const activeCategories = await Category.find({
                isActive: true,
                isDeleted: false,
            }).select("_id");
            const activeCategoryIds = activeCategories.map((cat) => cat._id.toString());

            if (categoryId) {
                // Nếu chọn 1 category cụ thể, kiểm tra xem nó có active không
                if (activeCategoryIds.includes(categoryId.toString())) {
                    query.category = categoryId;
                } else {
                    // Nếu category đó bị ẩn/xóa -> Trả về rỗng
                    return {
                        EC: 0,
                        EM: "Danh mục hiện không khả dụng",
                        DT: { products: [], totalItems: 0, page: pageNum, limit: limitNum },
                    };
                }
            } else {
                // Nếu không chọn category cụ thể (Tab Tất cả) -> Chỉ lấy sản phẩm của các cat đang active
                query.category = { $in: activeCategoryIds };
            }
        } else if (categoryId) {
            // Trường hợp không yêu cầu onlyActiveCategory (ví dụ trang Admin)
            query.category = categoryId;
        }

        // --- BƯỚC 3 & 4: Giữ nguyên (Sort & Execute) ---
        const sortMap = {
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            createAt_asc: { createAt: 1 },
            createAt_desc: { createAt: -1 },
        };
        const sortOptions = sortMap[sort] || { createdAt: -1 };

        const [products, totalItems] = await Promise.all([
            Product.find(query)
                .select("-__v")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate("category", "name"),
            Product.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalItems / limitNum);
        return {
            EC: 0,
            EM: "Lấy danh sách sản phẩm thành công",
            DT: {
                products,
                totalItems,
                page: pageNum,
                totalPages,
                limit: limitNum,
            },
        };
    } catch (error) {
        // ... catch error
        return {
            EC: -1,
            EM: "Lỗi server khi lấy danh sách sản phẩm",
            DT: { products: [], totalItems: 0 },
        };
    }
};

exports.adminChangeStatus = async (id, isActive) => {
    console.log("isActive", isActive)
    const updated = await productRepo.updateById(id, { isActive });
    if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
    return updated;
};

exports.setFeatured = async (id, { isFeatured, featuredRank }) => {
    const payload = { isFeatured };

    if (typeof featuredRank === "number") payload.featuredRank = featuredRank;
    else payload.featuredRank = isFeatured ? 1 : 0;

    const updated = await productRepo.updateById(id, payload);
    if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
    return updated;
};





module.exports.getAllProductsService = async (search, sort, page, limit, extraFilter = {}) => {
    try {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 15;
        const skip = (pageNum - 1) * limitNum;

        const { onlyActiveCategory, category, ...otherFilters } = extraFilter;
        let query = buildProductQuery({ search, ...otherFilters });

        // --- BƯỚC 1: Xử lý tìm ID từ Slug nếu có truyền category ---
        let categoryId = null;
        if (category && category !== "all") {
            const categoryDoc = await Category.findOne({ slug: category });
            if (!categoryDoc) {
                return {
                    EC: 0,
                    EM: "Không tìm thấy danh mục",
                    DT: { products: [], totalItems: 0 },
                };
            }
            categoryId = categoryDoc._id;
        }

        // --- BƯỚC 2: Xử lý logic lọc theo Only Active (Dành cho trang User) ---
        if (onlyActiveCategory) {
            // Lấy danh sách ID các category đang active
            const activeCategories = await Category.find({
                isActive: true,
                isDeleted: false,
            }).select("_id");
            const activeCategoryIds = activeCategories.map((cat) => cat._id.toString());

            if (categoryId) {
                // Nếu chọn 1 category cụ thể, kiểm tra xem nó có active không
                if (activeCategoryIds.includes(categoryId.toString())) {
                    query.category = categoryId;
                } else {
                    // Nếu category đó bị ẩn/xóa -> Trả về rỗng
                    return {
                        EC: 0,
                        EM: "Danh mục hiện không khả dụng",
                        DT: { products: [], totalItems: 0, page: pageNum, limit: limitNum },
                    };
                }
            } else {
                // Nếu không chọn category cụ thể (Tab Tất cả) -> Chỉ lấy sản phẩm của các cat đang active
                query.category = { $in: activeCategoryIds };
            }
        } else if (categoryId) {
            // Trường hợp không yêu cầu onlyActiveCategory (ví dụ trang Admin)
            query.category = categoryId;
        }

        // --- BƯỚC 3 & 4: Giữ nguyên (Sort & Execute) ---
        const sortMap = {
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            createAt_asc: { createAt: 1 },
            createAt_desc: { createAt: -1 },
        };
        const sortOptions = sortMap[sort] || { createdAt: -1 };

        const [products, totalItems] = await Promise.all([
            Product.find(query)
                .select("-__v")
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate("category", "name"),
            Product.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalItems / limitNum);
        return {
            EC: 0,
            EM: "Lấy danh sách sản phẩm thành công",
            DT: {
                products,
                totalItems,
                page: pageNum,
                totalPages,
                limit: limitNum,
            },
        };
    } catch (error) {
        // ... catch error
        return {
            EC: -1,
            EM: "Lỗi server khi lấy danh sách sản phẩm",
            DT: { products: [], totalItems: 0 },
        };
    }
};

module.exports.getProductByIdService = async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return {
            EC: 1,
            EM: "ID sản phẩm không hợp lệ",
            DT: null,
        };
    }

    try {
        const product = await Product.findById(_id)
            .populate("category", "name")
            .select("-__v");

        if (!product) {
            return {
                EC: 2,
                EM: "Không tìm thấy sản phẩm",
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: "Lấy chi tiết sản phẩm thành công",
            DT: product,
        };
    } catch (error) {
        console.log("getProductByIdService error:", error);
        return {
            EC: -1,
            EM: "Lỗi server khi lấy chi tiết sản phẩm",
            DT: null,
        };
    }
};

module.exports.getProductBySlugService = async (slug) => {
    try {
        const product = await Product.findOne({
            slug: slug,
            isDeleted: false,
        })
            .populate("category", "name")
            .select("-__v");

        if (!product) {
            return {
                EC: 2,
                EM: "Không tìm thấy sản phẩm với đường dẫn này",
                DT: null,
            };
        }

        return {
            EC: 0,
            EM: "Lấy chi tiết sản phẩm thành công",
            DT: product,
        };
    } catch (error) {
        console.log("getProductBySlugService error:", error);
        return {
            EC: -1,
            EM: "Lỗi server khi lấy chi tiết sản phẩm",
            DT: null,
        };
    }
};
module.exports.getTopNewProductsService = async (limit = 4) => {

    try {
        const activeCategories = await Category.find({
            isActive: true,
            isDeleted: false,
        }).select("_id");

        const activeCategoryIds = activeCategories.map((cat) => cat._id);

        const products = await Product.find({
            isDeleted: false,
            isActive: true,
            category: { $in: activeCategoryIds }
        })
            .select("-__v")
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("category", "name");

        return {
            EC: 0,
            EM: "Lấy danh sách sản phẩm mới nhất thành công",
            DT: products,
        };
    } catch (error) {
        console.error("getTopNewProductsService error:", error);
        return {
            EC: -1,
            EM: "Lỗi server khi lấy sản phẩm đặc biệt",
            DT: [],
        };
    }
};