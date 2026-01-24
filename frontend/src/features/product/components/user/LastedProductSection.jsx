import { forwardRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductComponent from "./ProductComponent";


import { fetchProductsForUser } from "../../product_slice";
import { useState } from "react";

import PaginationUser from "../../../../shared/ui/organisms/Pagination/PaginationUser";
import SectionHeader from "../../../../pages/client/public/home/header_section";

const LastedProductSection = forwardRef((_, ref) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const limit = 30;

  const [visibleCount, setVisibleCount] = useState(15);

  const { listProducts, isLoading, totalItems, totalPages } = useSelector(
    (state) => state.product
  );
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("search") || "";

  const handleLoadMore = () => {
    setVisibleCount(30);
    setIsExpanded(true);
  };

  const handleLoadLeft = () => {
    setVisibleCount(15);
    setIsExpanded(false);
  };

  const handlePageChange = (p) => {
    setPage(p);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (window.location.pathname === "/") {
      dispatch(
        fetchProductsForUser({
          page: page,
          limit: limit,
          search: keyword,
          sort: "name_asc",
          category: searchParams.get("category") || "",
        })
      );
    }
  }, [dispatch, page, keyword, searchParams]);

  const displayedProducts = listProducts
    ? listProducts.slice(0, visibleCount)
    : [];
  return (
    <section className="bg-[#ffffff] py-10 md:py-16" ref={ref}>
      <div className="space-y-8 w-[95vw] mx-auto">
        <SectionHeader
          mainTitle={"Recently Added"}
          subTitle={"Latest Products"}
        />

        {isLoading ? (
          <div className="text-center py-10">Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 justify-items-center">
            {listProducts && listProducts.length > 0 ? (
              <>
                {displayedProducts.map((fruit, index) => (
                  
                  <ProductComponent
                    key={fruit._id}
                    fruit={fruit}
                    
                    showDetails={() => navigate(`/details/${fruit.slug}`)}
                    num={index}
                   
                  />
                ))}
              </>
            ) : (
              <>
                <div className="col-span-full flex flex-col items-center justify-center py-32 w-full text-center">
                  <div className="text-6xl text-gray-300 mb-4 animate-bounce">
                    🔍
                  </div>
                  <p className="text-gray-500 text-xl font-medium max-w-md">
                    Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với
                    <span className="text-gray-800 block mt-1">
                      "{keyword}"
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      navigate("/");
                   
                    }}
                    className="mt-6 bg-[#49a760] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d8b50] transition-all shadow-lg active:scale-95"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-8 pt-4">
          {/* Hiện phân trang khi đã mở rộng */}
          {isExpanded && (
            <PaginationUser
              page={page}
              totalItems={totalItems}
              limit={limit}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}

          <div className="flex justify-center gap-4">
            {/* Nút Xem thêm hiện khi chưa mở rộng và danh sách thực tế lớn hơn 15 */}
            {!isExpanded && listProducts?.length > 15 && (
              <button
                onClick={handleLoadMore}
                className="rounded-xl py-3 px-10 text-white uppercase shadow-xl font-bold bg-[#49a760] hover:brightness-110 transition-all active:scale-95"
              >
                Xem thêm
              </button>
            )}

            {isExpanded && (
              <button
                onClick={handleLoadLeft}
                className="rounded-xl py-3 px-10 text-white uppercase shadow-xl font-bold bg-gray-500 hover:brightness-110 transition-all active:scale-95"
              >
                Thu gọn
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
LastedProductSection.displayName = "LastedProductSection";
export default LastedProductSection;
