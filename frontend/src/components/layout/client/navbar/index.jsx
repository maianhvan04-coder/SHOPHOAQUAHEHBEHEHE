import { useEffect, useState } from "react";
import { CiSearch, CiShoppingCart } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../../../features/cart/cart.slice";
import { fetchAllCategories } from "../../../../features/category/category.store";
import { useAuth } from "~/app/providers/AuthProvides";
import UserPopup from "./UserPopup";

const Navbar = ({ onScrollToSection }) => {
  const [openUser, setOpenUser] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMix, setOpenMix] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { isAuthed, user, logout } = useAuth();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ===== Sticky =====
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ===== Redux =====
  const { listCategories, isLoading } = useSelector((state) => state.category);
  const { totalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthed) dispatch(fetchCart());
  }, [isAuthed, dispatch]);

  // ===== Search =====
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    const currentPath = window.location.pathname;
    const targetPath = currentPath === "/category" ? "/category" : "/";

    if (term) {
      navigate(`${targetPath}?search=${encodeURIComponent(term)}`);
    } else {
      navigate(targetPath);
    }

    if (targetPath === "/") onScrollToSection?.("menuFruit");
  };

  // ===== Logout handler =====
  const handleLogout = async () => {
    await logout(); // ✅ gọi backend + clear state (AuthProvider)
    setOpenUser(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className={`
        bg-[#f8f7f2]
        py-4
        z-50
        transition-all duration-300
        ${
          isSticky
            ? "sticky top-0 w-full shadow-md"
            : "absolute top-[105px] left-0 w-[98vw]"
        }
      `}
    >
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="flex md:hidden items-center justify-between px-4">
        <span className="font-bold text-lg cursor-pointer" onClick={() => navigate("/")}>
          Joygreen
        </span>

        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
          >
            <CiSearch className="size-7 cursor-pointer" />
          </button>

          <div className="relative">
            <CiShoppingCart
              className="size-7 cursor-pointer"
              onClick={() => navigate("/cart")}
            />
            <span className="absolute -top-1 -right-1 min-w-3 h-3 flex items-center justify-center rounded-full bg-[var(--color-green-button)] px-1 text-[8px] font-semibold text-white">
              {totalQuantity}
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-2xl"
          >
            {isMobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE SEARCH ===== */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 mt-3 pb-2 transition-all duration-300">
          <form
            onSubmit={(e) => {
              handleSearch(e);
              setIsMobileSearchOpen(false);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              key={currentSearch}
              defaultValue={currentSearch}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm trái cây..."
              className="
                w-full rounded-full border border-gray-300 bg-white
                pl-4 pr-10 py-2.5 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-[#49a760]
              "
            />
            <button
              type="submit"
              className="absolute right-1.5 p-1.5 bg-[#49a760] text-white rounded-full active:scale-90 transition-transform"
            >
              <CiSearch className="size-5" />
            </button>
          </form>
        </div>
      )}

      {/* ===== MOBILE MENU ===== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#f8f7f2] border-t border-gray-200">
          <ul className="flex flex-col px-4 py-4 text-sm">
            <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); navigate("/"); }}>
              Home
            </li>

            <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); onScrollToSection?.("bestSeller"); }}>
              Best Seller
            </li>

            <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); onScrollToSection?.("menuFruit"); }}>
              Menu hoa quả
            </li>

            <li
              className="flex items-center justify-between py-2 font-medium"
              onClick={() => setOpenMix(!openMix)}
            >
              Hộp mix
              <MdKeyboardArrowDown className={`transition ${openMix ? "rotate-180" : ""}`} />
            </li>

            {openMix && (
              <ul className="ml-4 mb-2 space-y-1 text-gray-600">
                {isLoading
                  ? [1, 2, 3].map((i) => (
                      <li key={i} className="py-2 h-4 w-24 bg-gray-200 animate-pulse rounded" />
                    ))
                  : listCategories
                      .filter((cat) => cat.type === "mix")
                      .map((cat) => (
                        <li
                          key={cat._id}
                          className="py-1 cursor-pointer"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate(`/category?category=${cat.slug}`);
                          }}
                        >
                          {cat.name}
                        </li>
                      ))}
              </ul>
            )}

            <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); onScrollToSection?.("feedback"); }}>
              Feedback
            </li>

            <li
              className="flex items-center justify-between py-2 font-medium"
              onClick={() => setOpenShop(!openShop)}
            >
              Shop
              <MdKeyboardArrowDown className={`transition ${openShop ? "rotate-180" : ""}`} />
            </li>

            {openShop && (
              <ul className="ml-4 mb-2 space-y-1 text-gray-600">
                {isLoading
                  ? [1, 2, 3].map((i) => (
                      <li key={i} className="py-2 h-4 w-24 bg-gray-200 animate-pulse rounded" />
                    ))
                  : listCategories
                      .filter((cat) => cat.type === "single")
                      .map((cat) => (
                        <li
                          key={cat._id}
                          className="py-1 cursor-pointer"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate(`/category?category=${cat.slug}`);
                          }}
                        >
                          {cat.name}
                        </li>
                      ))}
              </ul>
            )}

            {!isAuthed ? (
              <>
                <li className="border-t mt-3 pt-3 py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }}>
                  Đăng nhập
                </li>
                <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }}>
                  Đăng ký
                </li>
              </>
            ) : (
              <>
                <li className="border-t mt-3 pt-3 py-2 font-medium" onClick={handleLogout}>
                  Đăng xuất
                </li>
                <li className="py-2 font-medium" onClick={() => { setIsMobileMenuOpen(false); navigate("/profile"); }}>
                  Tài khoản
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* ===== DESKTOP MENU ===== */}
      <ul className="hidden md:flex w-full mx-auto justify-center items-center gap-6 lg:gap-10 xl:gap-14">
        <li
          className="relative flex items-center gap-0.5 font-bold cursor-pointer hover:text-[#49a760] transition-colors"
          onClick={() => navigate("/")}
        >
          Home
          <MdKeyboardArrowDown />
        </li>

        <li className="cursor-pointer" onClick={() => onScrollToSection?.("bestSeller")}>
          Best Seller
        </li>

        <li className="cursor-pointer" onClick={() => onScrollToSection?.("menuFruit")}>
          Menu hoa quả
        </li>

        <li className="relative group flex items-center gap-0.5 cursor-pointer">
          Hộp mix <MdKeyboardArrowDown />
          <ul className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            {isLoading ? (
              <li className="px-5 py-2 text-gray-400 animate-pulse text-xs">Đang tải...</li>
            ) : (
              listCategories
                .filter((cat) => cat.type === "mix")
                .map((cat) => (
                  <li
                    key={cat._id}
                    onClick={() => navigate(`/category?category=${cat.slug}`)}
                    className="px-5 py-2.5 hover:bg-green-50 hover:text-[#49a760] transition-colors cursor-pointer text-sm font-normal"
                  >
                    {cat.name}
                  </li>
                ))
            )}
          </ul>
        </li>

        <li className="cursor-pointer" onClick={() => onScrollToSection?.("feedback")}>
          Feedback
        </li>

        <li className="relative group flex items-center gap-0.5 cursor-pointer">
          Shop <MdKeyboardArrowDown />
          <ul className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            {isLoading ? (
              <li className="px-5 py-2 text-gray-400 animate-pulse text-xs">Đang tải...</li>
            ) : (
              listCategories
                .filter((cat) => cat.type === "single")
                .map((cat) => (
                  <li
                    key={cat._id}
                    onClick={() => navigate(`/category?category=${cat.slug}`)}
                    className="px-5 py-2.5 hover:bg-green-50 hover:text-[#49a760] transition-colors cursor-pointer text-sm font-normal"
                  >
                    {cat.name}
                  </li>
                ))
            )}
          </ul>
        </li>

        <li
          onClick={() => onScrollToSection?.("contact")}
          className="relative pe-6 after:absolute after:right-[-16px] after:top-0 after:bottom-0 after:w-px after:bg-gray-300 cursor-pointer"
        >
          Contact
        </li>

        <li className="relative flex gap-3 items-center">
          {/* Search */}
          <div className="relative group">
            <CiSearch className="size-7 cursor-pointer" />
            <div className="absolute right-0 top-10 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-2">
              <div className="relative flex items-center">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                  <input
                    key={currentSearch}
                    type="text"
                    defaultValue={currentSearch}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm kiếm trái cây..."
                    className="w-full rounded-full border border-gray-200 bg-white pl-4 pr-12 py-2.5 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-[#49a760] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 p-2 text-white bg-[#49a760] rounded-full hover:bg-[#3d8b50] transition-colors active:scale-95 flex items-center justify-center"
                  >
                    <CiSearch size={20} strokeWidth={1} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="relative">
            <CiShoppingCart className="size-7 cursor-pointer" onClick={() => navigate("/cart")} />
            <span className="absolute -top-1 -right-2 min-w-4 h-4 flex items-center justify-center rounded-full bg-[var(--color-green-button)] px-1 text-[10px] font-semibold text-white">
              {totalQuantity}
            </span>
          </div>

          {/* User */}
          <div className="relative group">
            <span className="inline-flex items-center gap-1 px-3 py-2 cursor-pointer" onClick={() => navigate(isAuthed ? "/profile" : "/login")}>
              <FaRegUser />
              <MdKeyboardArrowDown />
            </span>

            <Dropdown align="right">
              {!isAuthed ? (
                <>
                  <DropdownItem text="Đăng nhập" onClick={() => navigate("/login")} />
                  <DropdownItem text="Đăng ký" onClick={() => navigate("/register")} />
                </>
              ) : (
                <div className="absolute right-0 mt-3 z-50">
                  <UserPopup
                    user={user}
                    onProfile={() => {
                      setOpenUser(false);
                      navigate("/profile");
                    }}
                    onMyOrders={() => {
                      setOpenUser(false);
                      navigate("/my-orders");
                    }}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </Dropdown>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

const Dropdown = ({ children, align = "left" }) => (
  <ul
    className={`
      absolute top-full mt-3 w-48
      bg-[#f8f7f2]
      shadow-xl rounded-lg py-2
      opacity-0 invisible
      group-hover:opacity-100 group-hover:visible
      transition-all duration-300
      border border-gray-100
      z-50
      ${align === "right" ? "right-0" : "left-0"}
    `}
  >
    {children}
  </ul>
);

const DropdownItem = ({ text, onClick }) => (
  <li
    onClick={onClick}
    className="px-5 py-2.5 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:text-green-600 transition cursor-pointer"
  >
    {text}
  </li>
);
