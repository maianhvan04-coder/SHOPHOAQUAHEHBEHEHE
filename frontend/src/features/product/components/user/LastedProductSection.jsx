import { forwardRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductComponent from "./ProductComponent";
import SectionHeader from "../../../../pages/public/home/header_section";

import { fetchProductsForUser } from "../../product_slice";
import { useState } from "react";

import PaginationUser from "../../../../shared/ui/organisms/Pagination/PaginationUser";


const LastedProductSection = forwardRef((_, ref) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [limit, setLimit] = useState(15);
  const { listProducts, isLoading, totalItems, totalPages } = useSelector(
    (state) => state.product
  );
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("search") || ""
  const handleLoadMore = () => {
    setLimit((prev) => prev + 15);
    setPage(1);
    setIsExpanded(true);
  };
  const handleLoadLeft = () => {
    setLimit(15);
    setPage(1);
    setIsExpanded(false);
  };
  const handlePageChange = (p) => {
    setPage(p);

    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
useEffect(() => {
  // Chỉ chạy logic này khi ở Trang chủ
  if (window.location.pathname === "/") {
    dispatch(
      fetchProductsForUser({
        page: page,
        limit: limit,
        search: keyword, // Dùng trực tiếp searchTerm từ URL
        sort: "name_asc",
        category: searchParams.get("category") || "" // Thêm cả lọc category nếu cần
      })
    );
  }
}, [dispatch, limit, page, keyword,]);

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
            {listProducts &&
              listProducts.map((fruit, index) => {
                return (
                  <ProductComponent
                    key={fruit._id}
                    img={fruit.image.url}
                    title={fruit.name}
                    showDetails={() => navigate(`/details/${fruit.slug}`)}
                    num={index}
                    description={
                      "Trái Cây Tươi Ngon – Gọt Sẵn, Tiện Lợi Mỗi Ngày!"
                    }
                  />
                );
              })}
          </div>
        )}

        <div className="flex flex-col items-center gap-8 pt-4">
          {isExpanded && totalItems > limit && (
           <PaginationUser page={page}
           totalItems={totalItems}
           limit={limit}
           totalPages={totalPages}
           handlePageChange={handlePageChange}
           ></PaginationUser>
          )}
          <div className="flex justify-center gap-4">
          
            {!isExpanded && listProducts?.length < totalItems && (
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
