const ApiError = require("../../../../core/ApiError")
const authRepo = require("./auth.repo")
const httpStatus = require("../../../../core/httpStatus")
const useRepo = require("../user/user.repo")
const { hashPassword, comparePassword } = require("../../../../helpers/password.auth")
const { generateAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../../../../helpers/jwt.auth")
const rbacService = require("../rbac/rbac.service")
exports.login = async ({ email, password }) => {
  const user = await authRepo.findByEmailForLogin(email)

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");
  }

  const result = await comparePassword(password, user.passwordHash)

  if (!result) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");

  }

  const authz = await rbacService.buildAuthz(user._id)





  const accessToken = generateAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      type: authz?.type || "user",
      avatar: user.image?.url || "",
      avatar_hash: user.image?.publicId || "",
    },

    version: user.authzVersion || 0,
    accessToken,
    refreshToken

  };
}

exports.getMe = async (userId, authz) => {
  const user = await useRepo.findPublicById(userId)
  if (!user || user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");

  if (user.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Tài Khoản Bị Khóa");
  }

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      image: user.image || null,
      isActive: user.isActive,
      authzVersion: user.authzVersion || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    roles: authz?.roles || [],
    permissions: authz?.permissions || [],
  };
}

exports.register = async ({ fullName, email, password }) => {
  const existing = await authRepo.findAnyByEmail(email);

  // Trường hợp 1: user tồn tại & chưa bị xoá → không cho đăng ký lại
  if (existing && !existing.isDeleted) {
    throw new ApiError(httpStatus.CONFLICT, "Email đã tồn tại");
  }

  const passwordHash = await hashPassword(password);

  let user;

  // Trường hợp 2: user tồn tại nhưng đã bị xoá → khôi phục lại
  if (existing && existing.isDeleted) {
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.isDeleted = false;
    existing.isActive = true;
    user = await existing.save();
  } else {
    // Trường hợp 3: chưa có ai dùng email này → tạo mới
    user = await authRepo.createUser({ fullName, email, passwordHash });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};


exports.refreshToken = async (req) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Không có refresh token");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Refresh token không hợp lệ/ hết hạn"
    );
  }

  const userId = payload.sub;

  const user = await authRepo.findById(userId); // đã filter isDeleted: false
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  return { accessToken: newAccessToken, newRefreshToken, user };
};


exports.logout = async (req) => {
  // Nếu bạn không lưu token ở DB thì không cần xử lý gì thêm.
  return { ok: true };
};
