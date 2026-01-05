// category.service.js
const mongoose = require("mongoose");
const { makeSlug } = require("../../../../helpers/makeSlug.js");

const ApiError = require("../../../../core/apiError.js");
const httpStatus = require("../../../../core/httpStatus.js");

const categoryRepo = require("./category.repo");
const { parsePagination, parseBoolean } = require("../../../../helpers/query.util.js");

// ===== helpers =====
const ensureObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "CategoryId không hợp lệ");
  }
};

const validateName = (name) => {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new ApiError(httpStatus.BAD_REQUEST, "Name là bắt buộc");
  if (trimmed.length < 3) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Tên danh mục phải có ít nhất 3 ký tự!");
  }
  return trimmed;
};

// ✅ map shop -> single, chỉ cho single|mix
const normalizeType = (t) => {
  const v = String(t || "").trim().toLowerCase();
  if (!v || v === "shop") return "single";
  if (v === "single" || v === "mix") return v;
  return "single";
};

// ================== CREATE ==================
exports.create = async (payload = {}) => {
  const name = validateName(payload.name);

  const description = (payload.description || "").trim();
  const type = normalizeType(payload.type);
  const isActive = payload.isActive !== undefined ? !!payload.isActive : true;

  // ✅ check trùng NAME (name unique)
  const existedByName = await categoryRepo.findAnyByName(name);

  if (existedByName && !existedByName.isDeleted) {
    throw new ApiError(httpStatus.CONFLICT, `Danh mục "${name}" đã tồn tại`);
  }

  // ✅ revive nếu đã soft delete
  if (existedByName && existedByName.isDeleted) {
    existedByName.name = name;
    existedByName.slug = makeSlug(name);
    existedByName.description = description;
    existedByName.type = type;
    existedByName.isActive = isActive;
    existedByName.isDeleted = false;
    await existedByName.save();
    return existedByName;
  }

  const slug = makeSlug(name);

  const existedBySlug = await categoryRepo.findAnyBySlug(slug);
  if (existedBySlug && !existedBySlug.isDeleted) {
    throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
  }

  return categoryRepo.create({
    name,
    slug,
    description,
    type,
    isActive,
    isDeleted: false,
  });
};

// ================== LIST (ADMIN) ==================
exports.adminList = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const search = query.search?.trim();
  const type = query.type?.trim();
  const isActive = parseBoolean(query.isActive);

  // ✅ thêm tab (active|deleted)
  const tab = String(query.tab || "active").trim().toLowerCase();
  const isDeleted = tab === "deleted";

  const { items, total } = await categoryRepo.listAdmin({
    page,
    limit,
    search,
    type,
    isActive,
    isDeleted, // ✅ NEW
  });

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ================== LIST (PUBLIC) ==================
exports.publicList = async (query = {}) => {
  const { page, limit } = parsePagination(query);
  const search = query.search?.trim();
  const type = query.type?.trim();

  const { items, total } = await categoryRepo.listPublic({
    page,
    limit,
    search,
    type,
  });

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ================== GET BY ID ==================
exports.adminGetById = async (id) => {
  ensureObjectId(id);
  const cat = await categoryRepo.findByIdAdmin(id);
  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  return cat;
};

exports.publicGetById = async (id) => {
  ensureObjectId(id);
  const cat = await categoryRepo.findByIdPublic(id);
  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  return cat;
};

// ================== UPDATE (slug auto 100%) ==================
exports.update = async (id, payload = {}) => {
  ensureObjectId(id);

  const current = await categoryRepo.findByIdAdmin(id);
  if (!current) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  if (current.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Category đã bị xóa, không thể cập nhật");
  }

  const updateData = {};

  if (payload.name !== undefined) {
    const newName = validateName(payload.name);

    const existedName = await categoryRepo.findAnyByNameExceptId(newName, id);
    if (existedName && !existedName.isDeleted) {
      throw new ApiError(httpStatus.CONFLICT, `Danh mục "${newName}" đã tồn tại`);
    }

    const newSlug = makeSlug(newName);

    const existedSlug = await categoryRepo.findAnyBySlug(newSlug);
    if (existedSlug && existedSlug._id.toString() !== id && !existedSlug.isDeleted) {
      throw new ApiError(httpStatus.CONFLICT, "Slug đã tồn tại");
    }

    updateData.name = newName;
    updateData.slug = newSlug;
  }

  if (payload.description !== undefined) {
    updateData.description = String(payload.description).trim();
  }

  if (payload.type !== undefined) {
    updateData.type = normalizeType(payload.type); // ✅ shop -> single
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = !!payload.isActive;
  }

  const updated = await categoryRepo.updateById(id, updateData);
  if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  return updated;
};

// ================== CHANGE STATUS ==================
exports.changeStatus = async (id, isActive) => {
  ensureObjectId(id);

  const current = await categoryRepo.findByIdAdmin(id);
  if (!current) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  if (current.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Category đã bị xóa, không thể đổi trạng thái");
  }

  const updated = await categoryRepo.updateById(id, { isActive: !!isActive });
  if (!updated) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  return updated;
};

// ================== SOFT DELETE ==================
exports.softDelete = async (id) => {
  ensureObjectId(id);

  const current = await categoryRepo.findByIdAdmin(id);
  if (!current) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  if (current.isDeleted) return current;

  const deleted = await categoryRepo.softDeleteById(id);
  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy category");
  return deleted;
};
// ================== RESTORE ==================
exports.restore = async (id) => {
  ensureObjectId(id);

  const restored = await categoryRepo.restoreById(id);
  if (!restored) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Category không nằm trong thùng rác hoặc không tồn tại");
  }
  return restored;
};

// ================== HARD DELETE ==================
exports.hardDelete = async (id) => {
  ensureObjectId(id);

  const deleted = await categoryRepo.hardDeleteById(id);
  if (!deleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Chỉ xoá vĩnh viễn khi category đang ở thùng rác");
  }
  return deleted;
};
