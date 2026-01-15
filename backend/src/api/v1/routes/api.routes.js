const router = require("express").Router();

const auth = require("../modules/auth/auth.routes");
const user = require("../modules/user/user.routes");
const publicUser = require("../modules/user/publicUser.routes");
const rbac = require("../modules/rbac/rbacAdmin.routes");
const categoryAdmin = require("../modules/category/category.admin.routes");
const categoryPublic = require("../modules/category/category.public.routes");
const productAdmin = require("../modules/product/product.admin.routes");
const Audit = require("../modules/audit/audit.routers");
const uploadRoutes = require("../modules/upload/upload.routes");

const publicProduct = require("../modules/product/public.router");
const orderUserRouter = require("../modules/order/routes/order.user.routes");
const orderAdminRoute = require("../modules/order/routes/order.admin.routes");
const orderStaffRoute = require("../modules/order/routes/order.staff.routes");
const orderDashboardRoute = require("../modules/order/routes/order.dashboard.routes");
const cartRouter = require("../modules/cart/cart.route")
const chatRoutes = require("../modules/chat/chat.route");
const feedbackRoute = require("../modules/feedback/feedback.route");
const uploadFeedbackRoute = require("../modules/upload/upload-feedback.routes")
const { guard } = require("../middlewares/auth");
const { PERMISSIONS } = require("../../../constants/permissions");
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
module.exports = (app) => {
  const v1 = "/api/v1";
  app.use(v1 + "/auth", auth);
  app.use(v1 + "/admin/rbac", rbac);

  // admin
  app.use(v1 + "/admin/user", ...guard({ any: [PERMISSIONS.USER_READ] }), user);

  app.use(v1 + "/admin/category", ...guard({ any: [PERMISSIONS.CATEGORY_READ] }), categoryAdmin);
  app.use(v1 + "/admin/product", ...guard({ any: [PERMISSIONS.PRODUCT_READ] }), productAdmin);

  app.use(v1 + "/admin/upload", uploadRoutes);
  app.use(v1 + "/admin/order", ...guard({ any: [PERMISSIONS.ORDER_READ] }), orderAdminRoute);
  // staff (xem đơn của mình + claim)
  app.use(v1 + "/staff/order", ...guard({
    any: [
      PERMISSIONS.ORDER_STAFF_INBOX_READ,
      PERMISSIONS.ORDER_STAFF_MY_READ,
      PERMISSIONS.ORDER_STAFF_CLAIM,
    ],
  }),
  orderStaffRoute
);

  // dashboard (staff xem của mình, admin xem all + compare)
  app.use(v1 + "/dashboard/order", ...guard({ any: [PERMISSIONS.ORDER_READ] }), orderDashboardRoute);




  // audit 
  app.use(v1 + "/admin/audit", ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_READ] }), Audit);



  app.use(
  v1 + "/dashboard/order",
  ...guard({ any: [PERMISSIONS.ORDER_READ, PERMISSIONS.ORDER_STAFF_MY_READ] }),
  orderDashboardRoute
);
  
  // public client
  app.use(v1 + "/products", publicProduct);
  app.use(v1 + "/categories", categoryPublic);
  app.use(v1 + "/order", orderUserRouter);
  app.use(v1 + "/users", publicUser);
  app.use(v1 + "/cart", cartRouter);
  app.use(v1 + "/feedback", feedbackRoute);
  app.use(v1 + "/upload", uploadFeedbackRoute);
  // ✅ chatbot
  app.use(v1 + "/chat", chatRoutes);
};
