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