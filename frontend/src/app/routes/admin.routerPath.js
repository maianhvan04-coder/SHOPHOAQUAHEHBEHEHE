import { lazy } from "react";

const Users = lazy(() => import("~/pages/admin/Users"));
const Categories = lazy(() => import("~/features/category/pages/admin"));
const Products = lazy(() => import("~/pages/admin/Products"));
const Rbac = lazy(() => import("~/pages/admin/Roles"));
const Orders = lazy(() => import("~/features/order/pages/OrderManagementPage"));
const InboxOrders = lazy(() => import("~/features/order/pages/OrderInboxPage"));
const MyStaffOrders = lazy(() => import("~/features/order/pages/MyStaffOrdersPage"));
const Profile = lazy(() => import("~/pages/admin/Profile"));
const Settings = lazy(() => import("~/pages/admin/Settings"));
const AuditProduct = lazy(() => import("~/features/audit/pages/ProductAuditListPage"));
const AuditProductDetails = lazy(() => import("~/features/audit/pages/ProductAuditDetailPage"));
const Dashboard = lazy(() => import("~/pages/admin/Dashboard"));
const DashboardMonth = lazy(() => import("~/pages/admin/Dashboard"));
export const adminRouters = [
  { path: "user", component: Users }, // /admin/user
  { path: "category", component: Categories }, // /admin/category
  { path: "product", component: Products },   // /admin/product
  { path: "rbac", component: Rbac },
  { path: "dashboard", component: DashboardMonth },
  { path: "profile", component: Profile },
  { path: "order", component: Orders }, // /admin/rbac
  { path: "audit/product", component: AuditProduct },
  { path: "audit/product/:auditId", component: AuditProductDetails },
 // orders
  { path: "order", component: Orders },
  { path: "order-inbox", component: InboxOrders },      // staff inbox claim
  { path: "my-staff-orders", component: MyStaffOrders },                 // admin xem tất cả
  // { path: "order-inbox", component: InboxOrders },      // staff inbox claim
  // { path: "my-staff-orders", component: MyStaffOrders },// staff đơn của mình


  { path: "settings", component: Settings },
];
