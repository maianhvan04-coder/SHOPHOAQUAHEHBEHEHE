const asyncHandler = require("../../../../core/asyncHandler");
const categoryService = require("./category.service");
const handleServerError = require("../../../../helpers/handleServerError");

exports.create = asyncHandler(async (req, res) => {


    const data = await categoryService.create(req.body);
    res.json({ message: "Tạo category thành công", data });
});

exports.adminList = asyncHandler(async (req, res) => {
    const data = await categoryService.adminList(req.query);
    res.json({ data });
});

exports.publicList = asyncHandler(async (req, res) => {
    const data = await categoryService.publicList(req.query);
    res.json({ data });
});

exports.adminGetById = asyncHandler(async (req, res) => {
    const data = await categoryService.adminGetById(req.params.id);
    res.json({ data });
});

exports.publicGetById = asyncHandler(async (req, res) => {
    const data = await categoryService.publicGetById(req.params.id);
    res.json({ data });
});

exports.update = asyncHandler(async (req, res) => {
    const data = await categoryService.update(req.params.id, req.body);
    res.json({ message: "Cập nhật category thành công", data });
});

exports.changeStatus = asyncHandler(async (req, res) => {
    const data = await categoryService.changeStatus(req.params.id, req.body.isActive);
    res.json({ message: "Đổi trạng thái category thành công", data });
});

exports.softDelete = asyncHandler(async (req, res) => {
    const data = await categoryService.softDelete(req.params.id);
    res.json({ message: "Xoá category thành công (soft)", data });
});






// Thien

module.exports.getAllCategories = async (req, res) => {
    console.log(">>>>DDAy Nay")
    try {
        const { search, sort, page, limit } = req.query;
        const filter = { isActive: true };
        const result = await categoryService.getAllCategoriesService(
            search,
            sort,
            page,
            limit,
            filter
        );
        console.log(result)
        return res.status(200).json(result);
    } catch (error) {
        console.log("Loi server", error.message)
        handleServerError(res);
    }
};

module.exports.getCategoryDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await categoryService.getCategoryById(id);

        if (result.EC === 0 && !result.DT) {
            return res.status(404).json({
                EC: 3,
                EM: "Không tìm thấy danh mục",
                DT: null,
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        handleServerError(res);
    }
};