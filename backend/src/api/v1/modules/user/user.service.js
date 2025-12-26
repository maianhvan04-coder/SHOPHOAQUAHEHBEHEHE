const userRepo = require("./user.repo")
const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");
const { uploadAvatarBuffer, destroyByPublicId } = require("../../../../helpers/cloudinary.helper")
const { ROLES } = require("../../../../constants/roles");
const { mongoose } = require("mongoose");

function normalizeIds(ids) {
  const unique = Array.from(new Set(ids || []))
  const valid = unique.filter((id) => mongoose.Types.ObjectId.isValid(id))
  return { unique, valid }
}

exports.getUsers = async (query) => {
  let { page = 1, limit = 5, search, role, isActive } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  // isActive là string từ query => convert
  if (isActive === "true") isActive = true;
  else if (isActive === "false") isActive = false;
  else isActive = undefined;

  // role nên ép đúng enum schema
  if (role) {
    role = role.toUpperCase();
    if (!Object.values(ROLES).includes(role)) {
      role = undefined; // hoặc throw lỗi nếu muốn chặt
    }
  } // USER/ADMIN

  const { users, total } = await userRepo.findUsers({
    page,
    limit,
    search,
    role,
    isActive,
  });

  return {
    items: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

exports.deleteUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "UserId không hợp lệ");
  }

  const user = await userRepo.findById(id)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy user");

  }
  if (user.role === ROLES.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Không thể xoá tài khoản ADMIN");
  }

  await userRepo.softDeleteById(id)
  return true;
}


exports.changeStatusMany = async (ids, isActive, actorId = null) => {

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "ids phải là mảng và không được rỗng");
  }
  if (typeof isActive !== "boolean") {
    throw new ApiError(httpStatus.BAD_REQUEST, "isActive phải là boolean");
  }

  const { unique, valid } = normalizeIds(ids)
  if (valid.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Không có userId hợp lệ");
  }


  const validWithoutSelf =
    actorId && mongoose.Types.ObjectId.isValid(actorId)
      ? valid.filter((id) => id !== actorId.toString())
      : valid;

  const metas = await userRepo.findMetaByIds(validWithoutSelf)

  const foundIds = new Set(metas.map((u) => u._id.toString()));
  const adminIds = metas.filter((u) => u.role === ROLES.ADMIN).map((u) => u._id.toString());
  const deletedIds = metas.filter((u) => u.isDeleted).map((u) => u._id.toString());

  // mục tiêu: tồn tại, chưa deleted, không admin
  const targetIds = metas
    .filter((u) => !u.isDeleted && u.role !== ROLES.ADMIN)
    .map((u) => u._id.toString());

  const updateRes =
    targetIds.length > 0 ? await userRepo.setActiveMany(targetIds, isActive) : { matchedCount: 0, modifiedCount: 0 };
  console.log("vào đến đây updateRes", updateRes)
  const notFoundCount = validWithoutSelf.filter((id) => !foundIds.has(id)).length;
  const selfSkipped = actorId ? valid.length - validWithoutSelf.length : 0;

  return {
    action: "SET_STATUS",
    requested: ids.length,
    unique: unique.length,
    valid: valid.length,
    found: metas.length,
    notFound: notFoundCount,
    skipped: {
      self: selfSkipped,
      admin: adminIds.length,
      deleted: deletedIds.length,
    },
    matchedCount: updateRes.matchedCount ?? updateRes.n ?? 0,
    modifiedCount: updateRes.modifiedCount ?? updateRes.nModified ?? 0,
  };
}

exports.softDeleteManyUsers = async (ids, actorId = null) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "ids phải là mảng và không được rỗng");
  }

  const { unique, valid } = normalizeIds(ids);
  if (valid.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Không có userId hợp lệ");
  }
  // (tuỳ chọn) tránh tự xoá mình
  const validWithoutSelf =
    actorId && mongoose.Types.ObjectId.isValid(actorId)
      ? valid.filter((id) => id !== actorId.toString())
      : valid;

  const metas = await userRepo.findMetaByIds(validWithoutSelf);
  const foundIds = new Set(metas.map((u) => u._id.toString()));

  const adminIds = metas.filter((u) => u.role === ROLES.ADMIN).map((u) => u._id.toString());
  const alreadyDeletedIds = metas.filter((u) => u.isDeleted).map((u) => u._id.toString());

  // mục tiêu: tồn tại, chưa deleted, không admin
  const targetIds = metas
    .filter((u) => !u.isDeleted && u.role !== ROLES.ADMIN)
    .map((u) => u._id.toString());

  const updateRes =
    targetIds.length > 0 ? await userRepo.softDeleteMany(targetIds) : { matchedCount: 0, modifiedCount: 0 };

  const notFoundCount = validWithoutSelf.filter((id) => !foundIds.has(id)).length;
  const selfSkipped = actorId ? valid.length - validWithoutSelf.length : 0;

  return {
    action: "SOFT_DELETE",
    requested: ids.length,
    unique: unique.length,
    valid: valid.length,
    found: metas.length,
    notFound: notFoundCount,
    skipped: {
      self: selfSkipped,
      admin: adminIds.length,
      alreadyDeleted: alreadyDeletedIds.length,
    },
    matchedCount: updateRes.matchedCount ?? updateRes.n ?? 0,
    modifiedCount: updateRes.modifiedCount ?? updateRes.nModified ?? 0,
  };
}

exports.updateMyAvatar = async (userId, file) => {
  if (!file?.buffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu file ảnh");
  }

  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");

  // Xoá ảnh cũ (nếu có) - fail thì bỏ qua để không làm hỏng request
  if (user.image?.publicId) {
    await destroyByPublicId(user.image.publicId).catch(() => { });
  }

  const uploaded = await uploadAvatarBuffer(file.buffer, userId);

  const updated = await userRepo.updateById(userId, {
    image: {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    },
  });

  return updated.image;
};