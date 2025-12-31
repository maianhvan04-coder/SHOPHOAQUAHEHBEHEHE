// category.controller.js
const asyncHandler = require("../../../../core/asyncHandler");
const categoryService = require("./category.service");

// ===== CRUD =====
exports.create = asyncHandler(async (req, res) => {
  const data = await categoryService.create(req.body);
  return res.json({
    EC: 0,
    EM: "Tạo category thành công",
    DT: data,
  });
});

exports.adminList = asyncHandler(async (req, res) => {
  const data = await categoryService.adminList(req.query); // { items, pagination }

  return res.json({
    EC: 0,
    EM: "Lấy danh sách category (admin) thành công",
    DT: {
      categories: data.items,
      totalItems: data.pagination.total,
      totalPages: data.pagination.totalPages,
      page: data.pagination.page,
      limit: data.pagination.limit,
    },
  });
});

exports.publicList = asyncHandler(async (req, res) => {
  const data = await categoryService.publicList(req.query); // { items, pagination }

  return res.json({
    EC: 0,
    EM: "Lấy danh sách category (public) thành công",
    DT: {
      categories: data.items,
      totalItems: data.pagination.total,
      totalPages: data.pagination.totalPages,
      page: data.pagination.page,
      limit: data.pagination.limit,
    },
  });
});

exports.adminGetById = asyncHandler(async (req, res) => {
  const data = await categoryService.adminGetById(req.params.id);
  return res.json({
    EC: 0,
    EM: "Lấy category (admin) thành công",
    DT: data,
  });
});

exports.publicGetById = asyncHandler(async (req, res) => {
  const data = await categoryService.publicGetById(req.params.id);
  return res.json({
    EC: 0,
    EM: "Lấy category (public) thành công",
    DT: data,
  });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  return res.json({
    EC: 0,
    EM: "Cập nhật category thành công",
    DT: data,
  });
});

exports.changeStatus = asyncHandler(async (req, res) => {
  const data = await categoryService.changeStatus(req.params.id, req.body.isActive);
  return res.json({
    EC: 0,
    EM: "Đổi trạng thái category thành công",
    DT: data,
  });
});

exports.softDelete = asyncHandler(async (req, res) => {
  const data = await categoryService.softDelete(req.params.id);
  return res.json({
    EC: 0,
    EM: "Xoá category thành công (soft)",
    DT: data,
  });
});

// ===== BACKWARD-COMPAT (nếu routes cũ vẫn gọi) =====
exports.getAllCategories = asyncHandler(async (req, res) => {
  // map về publicList và bọc format EC/EM/DT giống nhau
  const q = { ...req.query, isActive: true };
  const data = await categoryService.publicList(q);
  return res.json({
    EC: 0,
    EM: "Lấy danh sách danh mục thành công",
    DT: data,
  });
});

exports.getCategoryDetails = asyncHandler(async (req, res) => {
  const data = await categoryService.publicGetById(req.params.id);
  return res.json({
    EC: 0,
    EM: "Lấy danh mục thành công",
    DT: data,
  });
});
