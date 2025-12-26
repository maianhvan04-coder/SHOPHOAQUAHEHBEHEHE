import React, { useEffect } from "react";
import ProductComponent from "../../features/product/components/user/ProductComponent";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../../features/category/category.store";
import { fetchProductsForUser } from "../../features/product/product_slice";
import PaginationUser from "../../shared/ui/organisms/Pagination/PaginationUser"; // Import component phân trang của bạn

const ShopPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Quản lý State cho phân trang và sắp xếp
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "createAt_desc";
  const categorySlug = searchParams.get("category") || "";
  const keyword = searchParams.get("search") || "";
  const limit = 12;

  // 2. Lấy dữ liệu từ Redux
  const { listCategories } = useSelector((state) => state.category);
  const { listProducts, isLoading, totalItems, totalPages } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // 3. Mỗi khi slug, keyword, page hoặc sort thay đổi -> Gọi API
  useEffect(() => {
    dispatch(
      fetchProductsForUser({
        category: categorySlug,
        search: keyword,
        sort: sort,
        limit: limit,
        page: page,
      })
    );
    // Cuộn lên đầu lưới sản phẩm khi đổi trang/lọc
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categorySlug, keyword, page, sort, dispatch]);

  // 4. Các hàm xử lý thay đổi URL (để đồng bộ UI và Logic)
  const handlePageChange = (newPage) => {
    searchParams.set("page", newPage);
    setSearchParams(searchParams);
  };

  const handleSortChange = (newSort) => {
    searchParams.set("sort", newSort);
    searchParams.set("page", 1); // Reset về trang 1 khi đổi kiểu sắp xếp
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-18 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row gap-10">
        
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-8">
            <div>
              <h2 className="text-xl font-black text-gray-800 mb-6 tracking-wider uppercase">
                Bộ lọc <span className="text-[#c4cd38]">.</span>
              </h2>
              <ul className="space-y-3">
                <li
                  onClick={() => navigate("/category")}
                  className={`group cursor-pointer flex items-center justify-between p-3 rounded-xl transition-all ${
                    categorySlug === ""
                      ? "bg-[#49a760] text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  <span className="text-sm font-bold uppercase">Tất cả sản phẩm</span>
                </li>

                {listCategories?.map((cat) => (
                  <li
                    key={cat._id}
                    onClick={() => navigate(`/category?category=${cat.slug}`)}
                    className={`group cursor-pointer flex items-center justify-between p-3 rounded-xl transition-all ${
                      categorySlug === cat.slug
                        ? "bg-[#49a760] text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase">{cat.name}</span>
                    <div className={`size-2 rounded-full ${categorySlug === cat.slug ? "bg-white" : "bg-[#c4cd38]"}`} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* --- GRID SẢN PHẨM --- */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase leading-none">
                Cửa hàng <br />
                <span className="text-sm font-medium text-gray-400 normal-case tracking-normal italic">
                  {isLoading ? "Đang tải..." : `Kết quả: ${totalItems || 0} sản phẩm`}
                </span>
              </h1>
              {keyword && <p className="mt-2 text-sm text-gray-500 italic">Tìm kiếm: "{keyword}"</p>}
            </div>

            {/* BỘ LỌC SẮP XẾP */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Sắp xếp:</span>
              <select 
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#49a760] cursor-pointer"
              >
                <option value="createAt_desc">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="name_asc">Tên: A - Z</option>
                <option value="name_desc">Tên: Z - A</option>
              </select>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {!isLoading && listProducts?.map((item, index) => (
              <div key={item._id} className="flex justify-center w-full">
                <ProductComponent
                  img={item.image.url}
                  num={index}
                  title={item.name}
                  description={item.description}
                  showDetails={() => navigate(`/details/${item.slug}`)}
                />
              </div>
            ))}
          </div>

          {/* HIỂN THỊ KHI TRỐNG */}
          {!isLoading && listProducts?.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Rất tiếc, không tìm thấy sản phẩm nào phù hợp!</p>
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalItems > limit && (
            <div className="mt-16">
              <PaginationUser
                page={page}
                totalItems={totalItems}
                totalPages={totalPages}
                limit={limit}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;