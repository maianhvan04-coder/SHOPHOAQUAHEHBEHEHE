import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaUser,
  FaUserGear,
  FaChevronDown,
} from "react-icons/fa6";
import { RiAdminFill } from "react-icons/ri";
import { FaProductHunt } from "react-icons/fa6";
import { BiCategory } from "react-icons/bi";
import { axiosAdmin } from "../../../../shared/utils/axios.custiomize";
import logo from "../../../../assets/logo/logo.png"
import "./header.css";

function HeaderAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState(false);

  const isAdminAuthenticated =
    !!localStorage.getItem("admin_access_token") &&
    localStorage.getItem("admin_role") === "admin";

  const toggleSubmenu = () => setOpenSubmenu(!openSubmenu);

  // ===== LOGOUT ADMIN =====
  const handleLogout = async () => {
    try {
      await axiosAdmin.post("/api/v1/auth/admin/logout");
    } catch (err) {
      console.log("Logout error (ignore)", err);
    } finally {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_name");
      localStorage.removeItem("admin_role");

      setOpenSubmenu(false);
      navigate("/admin/login", { replace: true });
    }
  };

  // ===== ACTIVE MENU =====
  useEffect(() => {
    if (location.pathname.startsWith("/admin/home"))
      setActiveMenu("/admin/home");
    else if (location.pathname.startsWith("/admin/accounts"))
      setActiveMenu("/admin/accounts");
    else if (location.pathname.startsWith("/admin/user"))
      setActiveMenu("/admin/user");
    else if (location.pathname.startsWith("/admin/category"))
      setActiveMenu("/admin/category");
    else if (location.pathname.startsWith("/admin/product"))
      setActiveMenu("/admin/product");
  }, [location.pathname]);

  return (
    <aside className="admin-sidebar">
      <img src={logo} className="logo" alt="logo" />

      <nav className="sidebar-menu">
        <Link
          to="/admin/home"
          className={`menu-item ${
            activeMenu === "/admin/home" ? "active" : ""
          }`}
        >
          <FaHouse className="menu-icon" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/accounts"
          className={`menu-item ${
            activeMenu === "/admin/accounts" ? "active" : ""
          }`}
        >
          <RiAdminFill className="menu-icon" />
          <span>Admin</span>
        </Link>

        <Link
          to="/admin/user"
          className={`menu-item ${
            activeMenu === "/admin/user" ? "active" : ""
          }`}
        >
          <FaUser className="menu-icon" />
          <span>User</span>
        </Link>

        <Link
          to="/admin/category"
          className={`menu-item ${
            activeMenu === "/admin/category" ? "active" : ""
          }`}
        >
          <BiCategory className="menu-icon" />
          <span>Category</span>
        </Link>

        <Link
          to="/admin/product"
          className={`menu-item ${
            activeMenu === "/admin/product" ? "active" : ""
          }`}
        >
          <FaProductHunt className="menu-icon" />
          <span>Products</span>
        </Link>

        {/* ===== WELCOME ===== */}
        <div className="menu-item submenu" onClick={toggleSubmenu}>
          <div className="submenu-title">
            <FaUserGear className="menu-icon" />
            <span>Welcome</span>
            <FaChevronDown
              className={`arrow ${openSubmenu ? "open" : ""}`}
            />
          </div>

          {openSubmenu && (
            <div className="submenu-panel">
              {!isAdminAuthenticated && (
                <Link
                  to="/admin/login"
                  className="submenu-option"
                  onClick={() => setOpenSubmenu(false)}
                >
                  Đăng Nhập
                </Link>
              )}

              {isAdminAuthenticated && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="submenu-option"
                  style={{ cursor: "pointer" }}
                >
                  Đăng Xuất
                </span>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default HeaderAdmin;
