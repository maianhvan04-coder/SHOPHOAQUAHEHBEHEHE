import { Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "~/components/layout/client/index"; // layout user của bạn
import AdminLayout from "~/components/layout/admin/Layout"; // layout admin của bạn
import PrivateRoute from "../PrivateRoute"
// Guards
import AdminRoute from "../guards/admin.router"; // guard RBAC của bạn
// Nếu client cần bắt login thì tạo PrivateRoute tương tự

// Public pages/admin (client)
import ProductDetails from "~/pages/client/public/ProductDetailsPage";
import HomePage from "~/pages/client/public/HomePage";
import CartPage from "~/features/cart/page/CartPage";
import ShopPage from "~/pages/client/public/ShopPage";

// Auth pages (client)
import LoginPage from "~/features/auth/page/login/user/login.jsx";
import RegisterPage from "~/features/auth/page/register/user/register.jsx";
import ProfilePage from "~/features/profile/ProfilePage";

// Error pages
import ForbiddenPage from "~/pages/admin/ForbiddenPage";
import NotFound from "~/pages/admin/NotFound";

// Admin routers list
import { adminRouters } from "../admin.routerPath";

const routes = [
  // ===== CLIENT PUBLIC =====
  {
  path: "/",
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: "details/:slug", element: <ProductDetails /> },   
    { path: "category", element: <ShopPage /> },
    
    {
      element: <PrivateRoute />,
      children: [
      { path: "profile", element: <ProfilePage /> },
      { path: "cart", element: <CartPage /> },
     ],      
    },
  ],
},

 

  // ===== CLIENT AUTH =====
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // ===== ADMIN PRIVATE (RBAC) =====
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          // ✅ ĐỪNG redirect hardcode "home" nữa (vì catalog ko có)
          { index: true, element: <Navigate to="user" replace /> },

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