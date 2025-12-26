import { Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../../layouts/client/index";
import AdminLayout from "~/components/layout/Layout"; // layout admin của bạn

// Guards
import AdminRoute from "../guards/admin.router"; // guard RBAC của bạn
// Nếu client cần bắt login thì tạo PrivateRoute tương tự

// Public pages/admin (client)
import HomePage from "~/pages/public/HomePage";
import ProductDetails from "~/pages/public/ProductDetailsPage";
import CartPage from "~/pages/public/CartPage";
import ShopPage from "~/pages/public/ShopPage";

// Auth pages (client)
import LoginPage from "~/features/login/user/login.jsx";
import RegisterPage from "~/features/register/user/register.jsx";


// Error pages
import ForbiddenPage from "~/pages/admin/ForbiddenPage";
import NotFound from "~/pages/admin/NotFound";

// Admin routers list
import { adminRouters } from "../admin.routerPath";

const routes = [
  // ===== CLIENT PUBLIC =====
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "details/:slug", element: <ProductDetails /> },
      { path: "cart", element: <CartPage /> },
      { path: "category", element: <ShopPage /> },
    ],
  },

  // ===== CLIENT AUTH =====
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },


  // ===== ADMIN PRIVATE (RBAC) =====
  {
    path: "/admin",
    element: <AdminRoute />, // guard -> phải return <Outlet/>
    children: [
      {
        element: <AdminLayout />, // layout admin -> phải có <Outlet/>
        children: [
          // /admin -> redirect về /admin/home (hoặc screen đầu tiên)
          { index: true, element: <Navigate to="home" replace /> },

          // map các trang admin
          ...adminRouters.map((r) => {
            const Page = r.component;
            return { path: r.path, element: <Page /> };
          }),
        ],
      },
    ],
  },

  // ===== ERRORS =====
  { path: "/403", element: <ForbiddenPage /> },

  // ===== NOT FOUND =====
  { path: "*", element: <NotFound /> },
];

export default routes;
