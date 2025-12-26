import { ConfigProvider, Pagination } from "antd";

const PaginationUser = ({
  page,
  totalItems,
  totalPages,
  limit,
  handlePageChange,
}) => {
  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full py-8">
        {/* Dùng ConfigProvider để "nhuộm xanh" toàn bộ pagination mà không cần CSS */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#49a760", // Màu xanh lá shop của bạn
              borderRadius: 20, // Bo tròn các nút
            },
          }}
        >
          <Pagination
            current={page}
            total={totalItems}
            pageSize={limit}
            onChange={handlePageChange}
            showSizeChanger={false}
            responsive={true}
            
            showTotal={(total) => (
              <span className="text-gray-400 font-normal mr-6 tracking-wide">
                Tổng
                <span className="text-gray-800 font-semibold">{total}</span> sản
                phẩm
                <span className="mx-2 text-gray-300">|</span>
                Trang <span className="text-[#49a760] font-bold">{page}</span>
                <span className="text-gray-300">/</span>
                {totalPages}
              </span>
            )}
            className="select-none font-sans"
          />
        </ConfigProvider>
      </div>
    </>
  );
};
export default PaginationUser;
