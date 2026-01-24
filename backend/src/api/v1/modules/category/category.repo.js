// category.repo.js
const Category = require("./category.model");

exports.create = (payload) => Category.create(payload);

exports.findByIdAdmin = (id) =>
  Category.findOne({ _id: id, isDeleted: false }).select("-__v");

exports.findByIdPublic = (id) =>
  Category.findOne({ _id: id, isDeleted: false, isActive: true }).select("-__v");

exports.findAnyBySlug = (slug) =>
  Category.findOne({ slug: String(slug || "").trim() });

exports.findAnyByName = (name) =>
  Category.findOne({ name: String(name || "").trim() });

exports.findAnyByNameExceptId = (name, id) =>
  Category.findOne({
    name: String(name || "").trim(),
    _id: { $ne: id },
  });

// update
exports.updateById = (id, payload) =>
  Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-__v");

// soft delete
exports.softDeleteById = (id) =>
  Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } },
    { new: true }
  ).select("-__v");

// list admin: thấy active/inactive (không thấy deleted)
exports.listAdmin = async ({ page, limit, search, isActive, type, isDeleted }) => {
  // ✅ thay vì fix isDeleted:false
  const filter = { isDeleted: typeof isDeleted === "boolean" ? isDeleted : false };

  // ✅ nếu đang xem Deleted thì không cần filter isActive (vì bạn set isActive:false khi xóa)
  if (!filter.isDeleted && typeof isActive === "boolean") filter.isActive = isActive;

  if (type) filter.type = type;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Category.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return { items, total };
};

// list public: chỉ active + not deleted
exports.listPublic = async ({ page, limit, search, type }) => {
  const filter = { isDeleted: false, isActive: true };

  if (type) filter.type = type;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Category.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments(filter),
  ]);

  return { items, total };
};

// restore (khôi phục từ thùng rác)
exports.restoreById = (id) =>
  Category.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false, isActive: true } },
    { new: true }
  ).select("-__v");

// hard delete (xoá vĩnh viễn) - chỉ cho xoá khi isDeleted=true
exports.hardDeleteById = (id) =>
  Category.findOneAndDelete({ _id: id, isDeleted: true }).select("-__v");


exports.getCategoriesForProduct = async () => {
  const data = await Category.find({
    isActive: true,
    isDeleted: false
  }).select("_id name slug")
    .sort({ name: 1 })
    .lean()
  return data
}