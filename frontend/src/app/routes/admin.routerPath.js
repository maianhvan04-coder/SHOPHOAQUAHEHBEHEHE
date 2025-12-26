import { lazy } from "react";

const Dashboard = lazy(() => import("~/pages/admin/Dashboard"));
const Users = lazy(() => import("~/pages/admin/Users"));
const Roles = lazy(() => import("~/pages/admin/Roles"));

export const adminRouters = [
    { path: "home", component: Dashboard }, // /admin/home
    { path: "user", component: Users },     // /admin/user
    { path: "rbac", component: Roles },     // /admin/rbac
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
