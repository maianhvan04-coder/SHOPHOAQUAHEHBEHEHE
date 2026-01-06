const asyncHandler = require("../../../../core/asyncHandler");
// Getall User
const userService = require("./user.service");
module.exports.getAllUsers = (asyncHandler(async (req, res) => {

   const result = await userService.getUsers(req.query);
   res.json({ result })
}))
// Delete
module.exports.delete = (asyncHandler(async (req, res) => {

   const { id } = req.params
   // console.log(id)
   await userService.deleteUser(id)
   return res.json({
      message: "Xoá user thành công",
   });

}))

module.exports.createUser = async (req, res) => {

   try {
      const data = await userService.createUserAdmin(req.body);
      return res.status(201).json({ data });
   } catch (e) {
      return res.status(400).json({
         error: { message: e?.message || "Create user failed" },
      });
   }
}


exports.updateUserAdmin = async (req, res, next) => {
   try {
      const data = await userService.updateUserAdmin(req.params.id, req.body);
      res.json({ data });
   } catch (e) {
      next(e);
   }
};


module.exports.changeStatusMany = (asyncHandler(async (req, res) => {
   const { ids, isActive } = req.body
   const actorId = req.user?.sub || null
   // console.log(ids, isActive)
   const data = await userService.changeStatusMany(ids, isActive, actorId)
   res.json({
      data
   })
}))

module.exports.softDeleteManyUsers = (asyncHandler(async (req, res) => {
   const { ids } = req.body
   const actorId = req.user?.sub || null
   console.log("actorId", actorId)
   const data = await userService.softDeleteManyUsers(ids, actorId)
   res.json({
      data
   })
}))

exports.updateMyAvatar = asyncHandler(async (req, res) => {
   const image = await userService.updateMyAvatar(req.user.sub, req.file);

   res.json({
      message: "Cập nhật avatar thành công",
      data: { image },
   });
});




exports.updateMyProfile = asyncHandler(async (req, res) => {
   const userId = req.user.sub; // từ auth.middleware

   const updated = await userService.updateMyProfile(userId, req.body);

   res.json({
      data: updated,
      message: "Cập nhật profile thành công",
   });
});




exports.getAssignableRoles = asyncHandler(async (req, res, next) => {


   const roles = await userService.getAssignableRoles(req.user?.sub);

   return res.json({ result: roles });
});

exports.setUserRoles = asyncHandler(async (req, res, next) => {

   const userId = req.params.id;
   const { roleCodes } = req.body;

   const result = await userService.setUserRoles(userId, roleCodes, req.user?.sub);
   return res.json({ result });
});



module.exports.getAllUsersDeleted = (asyncHandler(async (req, res) => {
   const result = await userService.getUsersDeleted(req.query);
   res.json({ result })
}))


exports.restoreUser = asyncHandler(async (req, res) => {
   const { id } = req.params;
   const { restoreInactiveRoles = false } = req.body || {};

   const ok = await userService.restoreUser(id, { restoreInactiveRoles });

   return res.status(200).json({
      success: true,
      message: "Restore user thành công",
      result: ok,
   });
});

/**
 * PATCH /admin/users/bulk/restore
 * body: { ids: string[], restoreInactiveRoles?: boolean }
 */
exports.restoreUsersMany = asyncHandler(async (req, res) => {
   const { ids, restoreInactiveRoles = false } = req.body || {};

   if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "ids phải là mảng và không được rỗng");
   }

   const result = await userService.restoreUsersMany(ids, { restoreInactiveRoles });

   return res.status(httpStatus.OK).json({
      success: true,
      message: "Restore nhiều user thành công",
      result,
   });
});

// user.controller.js
exports.changeMyPassword = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const { oldPassword, newPassword } = req.body;

  const result = await userService.changeMyPassword(userId, oldPassword, newPassword);

  // ✅ nếu bạn dùng refresh_token cookie như login của bạn
  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth/refresh-token",
  });

  return res.json({
    message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại",
    data: result,
  });
});
