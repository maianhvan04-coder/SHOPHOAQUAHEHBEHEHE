const router = require("express").Router()


const auth = require("../modules/auth/auth.routes")
const user = require("../modules/user/user.routes")
const rbac = require("../modules/rbac/rbacAdmin.routes")
const categoryAdmin = require("../modules/category/category.admin.routes")
const categoryPublic = require("../modules/category/category.public.routes")
const productAdmin = require("../modules/product/product.admin.routes")
const uploadRoutes = require("../modules/upload/upload.routes");


const publicProduct = require("../modules/product/public.router")


router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
module.exports = (app) => {
  const v1 = "/api/v1"
  app.use(v1 + "/auth", auth)
  app.use(v1 + "/admin/rbac", rbac)


  // admin
  app.use(v1 + "/admin/user", user)
  app.use(v1 + "/admin/category", categoryAdmin)
  app.use(v1 + "/admin/product", productAdmin)
  app.use(v1 + "/products", publicProduct)
  app.use(v1 + "/admin/upload", uploadRoutes);
  // public client
  app.use(v1 + "/categories", categoryPublic)
}
