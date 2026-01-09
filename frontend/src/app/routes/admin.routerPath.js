import { lazy } from "react";

const Users = lazy(() => import("~/pages/admin/Users"));
const Categories = lazy(() => import("~/features/category/pages/admin"));
const Products = lazy(() => import("~/pages/admin/Products"));
const Rbac = lazy(() => import("~/pages/admin/Roles"));
const Orders = lazy(() => import("../../features/order/pages/OrderManagementPage"));
const Profile = lazy(() => import("~/pages/admin/Profile"));
const Settings = lazy(() => import("~/pages/admin/Settings"));
const Dashboard = lazy(() => import("~/pages/admin/Dashboard"));
export const adminRouters = [
  { path: "user", component: Users }, // /admin/user
  { path: "category", component: Categories }, // /admin/category
  { path: "product", component: Products },   // /admin/product
  { path: "rbac", component: Rbac },
  { path: "dashboard", component: Dashboard },
  { path: "profile", component: Profile },
  { path: "order", component: Orders }, // /admin/rbac

  { path: "settings", component: Settings },
];

// import { lazy } from "react";

// const HomeAdmin = lazy(() => import("~/pages/admin/home/home.jsx"));
// const AdminPage = lazy(() => import("~/pages/admin/adminpage/accounts.jsx"));
// const UserPage = lazy(() => import("~/pages/admin/userpage/user.jsx"));
// const ProductManagement = lazy(() => import("~/pages/admin/productmanagement/productManagement.jsx"));
// const CategoryManagement = lazy(() => import("~/pages/admin/categorymanagement/categoryManagement.jsx"));

// export const adminRouters = [
//   { path: "home", component: HomeAdmin },          // /admin/home
//   { path: "accounts", component: AdminPage },      // /admin/accounts
//   { path: "users", component: UserPage },          // /admin/users
//   { path: "products", component: ProductManagement }, // /admin/products
//   { path: "categories", component: CategoryManagement }, // /admin/categories
//   // { path: "rbac", component: Roles }, // nếu có
// ];
