
const asyncHandler = require("../../../../core/asyncHandler");
const productService = require("./product.service")
// exports.PRODUCT_SORT_KEYS = Object.keys(SORT_MAP); // nếu sau này muốn validate/hint
const handleServerError = require("../../../../helpers/handleServerError");

const {
    getAllCategoriesService,
    getCategoryById,
} = require("../category/category.service");
module.exports.adminList = asyncHandler(async (req, res) => {
    const data = await productService.productAdminList(req.query);
    res.json({ data })
})

module.exports.adminCreate = asyncHandler(async (req, res) => {

    const data = await productService.productAdminCreate(req.body);
    res.json({ message: "Tạo sản phẩm thành công", data })
})

module.exports.adminUpdate = asyncHandler(async (req, res) => {

    const data = await productService.productAdminUpdate(req.params.id, req.body);
    res.json({ message: "Cập nhật sản phẩm thành công" })
})

module.exports.softDelete = asyncHandler(async (req, res) => {

    const data = await productService.softDelete(req.params.id)
    res.json({ message: "Xoá sản phẩm thành công", data })
})


module.exports.adminGetById = asyncHandler(async (req, res) => {
    const data = await productService.adminGetById(req.params.id)
    res.json({ message: "Lấy sản phẩm thành công", data })
})

module.exports.changeStatus = asyncHandler(async (req, res) => {

    const { isActive } = req.body;
    const data = await productService.adminChangeStatus(req.params.id, isActive)
    res.json({ message: "Thay đổi trạng thái sản phẩm thành công", data })
})

exports.setFeatured = asyncHandler(async (req, res) => {
    const data = await productService.setFeatured(req.params.id, req.body);
    res.json({ message: "Cập nhật ưu tiên thành công", data });
});




// const productService = require("../product.service");

module.exports.getAllProducts = async (req, res) => {
    console.log("Vao den day")
    try {
        const { search, sort, page, limit, category = "all" } = req.query;

        const filter = {
            isActive: true,
            onlyActiveCategory: true,
            category: category,
        };
        const result = await productService.getAllProductsService(
            search,
            sort,
            page,
            limit,
            filter
        );
        console.log(result)
        if (result.EC !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        handleServerError(res);
    }
};
module.exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await productService.getProductBySlugService(slug);

        if (result.EC !== 0) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        handleServerError(res);
    }
};
module.exports.getProductByCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await productService.getProductsByCategory(id);
        if (result.EC !== 0) {
            return res.status(404).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        handleServerError(res);
    }
};
module.exports.getTopNewProducts = async (_, res) => {
    try {
        console.log("vào đây rồi nha")
        const result = await productService.getTopNewProductsService(
        );
        if (result.EC !== 0) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        handleServerError(res);
    }
};