const userRepo = require("./user.repo")
const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");
const { uploadAvatarBuffer, destroyByPublicId } = require("../../../../helpers/cloudinary.helper")
const { ROLES } = require("../../../../constants/roles");
const { mongoose } = require("mongoose");
const Role = require("../rbac/model/role.model")

const { hashPassword, comparePassword } = require("../../../../helpers/password.auth")

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


exports.getAssignableRoles = async () => {
  // chỉ trả role active, và thường không cho UI gán ADMIN
  const roles = await Role.find({ isActive: true, code: { $ne: "ADMIN" } })
    .select("_id code name type priority")
    .sort({ priority: -1 })
    .lean();

  return roles;
};


exports.setUserRoles = async (userId, roleCodes, actorId = null) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "UserId không hợp lệ");
  }

  const clean = Array.from(new Set((roleCodes || []).map((x) => String(x).trim().toUpperCase())));
  if (!clean.length) throw new ApiError(httpStatus.BAD_REQUEST, "roleCodes không được rỗng");
  if (clean.includes("ADMIN")) throw new ApiError(httpStatus.FORBIDDEN, "Không cho gán ADMIN qua API");

  const user = await userRepo.findById(userId);
  if (!user || user.isDeleted) throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy user");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const roles = await userRepo.replaceUserRolesByCodes(
      { userId, roleCodes: clean },
      { session }
    );


    await userRepo.bumpAuthzVersion(userId, { session });

    await session.commitTransaction();

    return {
      userId,
      roleCodes: roles.map((r) => r.code),
      roles: roles.map((r) => ({
        _id: r._id,
        code: r.code,
        name: r.name,
        type: r.type,
        priority: r.priority,
      })),
    };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

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

const normEmail = (email = "") => String(email).trim().toLowerCase();

exports.createUserAdmin = async (payload) => {
  console.log(payload)
  const fullName = String(payload.fullName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const phone = payload.phone ? String(payload.phone).replace(/\D/g, "").slice(0, 10) : "";
  const isActive = payload.isActive !== undefined ? !!payload.isActive : true;

  const roleCodes = Array.isArray(payload.roleCodes) ? payload.roleCodes : [];
  const password = String(payload.password || "");

  if (!fullName) throw new Error("fullName is required");
  if (!email) throw new Error("email is required");
  if (!password || password.length < 6) throw new Error("password min 6 chars");
  if (roleCodes.includes("ADMIN")) throw new Error("Không cho gán ADMIN qua API");

  const finalRoleCodes = roleCodes.length ? roleCodes : ["USER"];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exists = await userRepo.findByEmail(email, { session });
    if (exists) throw new Error("Email already exists");

    const passwordHash = await hashPassword(password, 10);

    const user = await userRepo.createOne(
      {
        fullName,
        email,
        phone,
        passwordHash,
        isActive,
        isDeleted: false,
      },
      { session }
    );

    const roles = await userRepo.replaceUserRolesByCodes(
      { userId: user._id, roleCodes: finalRoleCodes },
      { session }
    );

    await session.commitTransaction();

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: roles.map((r) => ({
        _id: r._id,
        code: r.code,
        name: r.name,
        type: r.type,
        priority: r.priority,
      })),
    };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

exports.updateUserAdmin = async (userId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "UserId không hợp lệ");
  }

  // lấy user + roles để check ADMIN
  const current = await userRepo.findUserWithRolesById(userId);
  if (!current || current.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy user");
  }

  const currentRoleCodes = (current.roles || []).map(r => r.code).filter(Boolean);
  if (currentRoleCodes.includes("ADMIN")) {
    throw new ApiError(httpStatus.FORBIDDEN, "Không thể cập nhật tài khoản ADMIN");
  }

  // normalize
  const fullName = payload.fullName !== undefined ? String(payload.fullName || "").trim() : undefined;
  const email = payload.email !== undefined ? String(payload.email || "").trim().toLowerCase() : undefined;
  const phone = payload.phone !== undefined ? String(payload.phone || "").replace(/\D/g, "").slice(0, 10) : undefined;
  const isActive = payload.isActive !== undefined ? !!payload.isActive : undefined;

  const roleCodes = Array.isArray(payload.roleCodes) ? payload.roleCodes.filter(Boolean) : undefined;
  const password = payload.password !== undefined ? String(payload.password || "") : undefined;

  // validate nhẹ
  if (fullName !== undefined && !fullName) {
    throw new ApiError(httpStatus.BAD_REQUEST, "fullName không hợp lệ");
  }
  if (email !== undefined && !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "email không hợp lệ");
  }
  if (password !== undefined && password && password.length < 6) {
    throw new ApiError(httpStatus.BAD_REQUEST, "password min 6 chars");
  }
  if (roleCodes && roleCodes.includes("ADMIN")) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Không cho gán ADMIN qua API");
  }

  // build update doc
  const updateDoc = {};
  if (fullName !== undefined) updateDoc.fullName = fullName;
  if (email !== undefined) updateDoc.email = email;
  if (phone !== undefined) updateDoc.phone = phone; // bạn muốn cho xoá phone thì cho phép ""
  if (isActive !== undefined) updateDoc.isActive = isActive;

  if (password) {
    updateDoc.passwordHash = await hashPassword(password, 10);
    updateDoc.authzVersion = (current.authzVersion || 0) + 1;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // check unique email
    if (email !== undefined && email !== current.email) {
      const existed = await userRepo.findByEmail(email, { session });
      if (existed && String(existed._id) !== String(userId)) {
        throw new ApiError(httpStatus.CONFLICT, "Email already exists");
      }
    }

    // check unique phone (skip nếu phone = "" và bạn cho phép xoá phone)
    if (phone !== undefined && phone !== (current.phone || "")) {
      if (phone) {
        const existedPhone = await userRepo.findByPhone(phone, { session });
        if (existedPhone && String(existedPhone._id) !== String(userId)) {
          throw new ApiError(httpStatus.CONFLICT, "Phone already exists");
        }
      }
    }

    // update user info
    if (Object.keys(updateDoc).length) {
      await userRepo.updateById(userId, updateDoc, { session });
    }

    // replace roles nếu truyền roleCodes
    if (roleCodes) {
      const finalRoleCodes = roleCodes.length ? roleCodes : ["USER"];
      await userRepo.replaceUserRolesByCodes(
        { userId, roleCodes: finalRoleCodes },
        { session }
      );
    }

    await session.commitTransaction();

    // trả về user + roles đúng format FE
    const updated = await userRepo.findUserWithRolesById(userId);
    return updated;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};



const pick = (obj, keys) => {
  const out = {};
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
};



exports.updateMyProfile = async (userId, body) => {
  // ✅ chỉ cho phép update các field này
  const payload = pick(body, ["fullName", "phone", "image", "addresses"]);

  // Validate nhẹ
  if (payload.fullName !== undefined) {
    payload.fullName = String(payload.fullName).trim();
    if (!payload.fullName) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Họ tên không hợp lệ");
    }
  }

  if (payload.phone !== undefined) {
    payload.phone = String(payload.phone).trim();
    if (!payload.phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Số điện thoại không hợp lệ");
    }

    // check trùng phone (trừ chính mình)
    const existed = await userRepo.findByPhone(payload.phone);
    if (existed && String(existed._id) !== String(userId)) {
      throw new ApiError(httpStatus.CONFLICT, "Số điện thoại đã được sử dụng");
    }
  }

  //normalize image
  if (payload.image !== undefined) {
    payload.image = {
      url: payload.image?.url ? String(payload.image.url).trim() : "",
      publicId: payload.image?.publicId ? String(payload.image.publicId).trim() : "",
    };
  }

  //addresses: nếu muốn bắt buộc 1 default thì làm ở đây
  if (payload.addresses !== undefined) {
    if (!Array.isArray(payload.addresses)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "addresses phải là mảng");
    }

    // đảm bảo đúng schema
    payload.addresses = payload.addresses.map((a) => ({
      name: a?.name ? String(a.name).trim() : "",
      phone: a?.phone ? String(a.phone).trim() : "",
      street: a?.street ? String(a.street).trim() : "",
      ward: a?.ward ? String(a.ward).trim() : "",
      district: a?.district ? String(a.district).trim() : "",
      province: a?.province ? String(a.province).trim() : "",
      isDefault: !!a?.isDefault,
    }));

    // optional: ép chỉ 1 default
    const defaultCount = payload.addresses.filter((x) => x.isDefault).length;
    if (defaultCount > 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Chỉ được chọn 1 địa chỉ mặc định");
    }
  }

  const updated = await userRepo.updateById(userId, payload);
  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy user");
  }

  // Không trả passwordHash
  const safe = await userRepo.findById(userId);
  return safe;
};