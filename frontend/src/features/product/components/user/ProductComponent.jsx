import { useNavigate } from "react-router-dom";
import favorite_icon from "../../../../assets/icons/favorite_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistLocal } from "../../../wishlist/wishlist.slice";
import { HeartOutlined } from "@ant-design/icons";
import { Modal } from "antd";

const ProductComponent = ({ fruit, num, showDetails }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);

  const { name, image, price, _id } = fruit;
  const isFavorite = items.includes(_id);
  const handleBuyNow = (e) => {
    e.stopPropagation();

    const buyNowData = [
      {
        product: _id,
        name: name,
        image: image.url,
        price: price,
        quantity: 1,
      },
    ];

    navigate("/checkout", { state: { orderItems: buyNowData } });
  };
const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Chặn việc nhảy vào xem chi tiết sản phẩm

    if (isFavorite) {
      // Nếu ĐÃ THÍCH -> Hiện bảng hỏi xác nhận xóa
      Modal.confirm({
        title: "Xóa khỏi mục yêu thích?",
        content: `Bạn có chắc chắn muốn bỏ "${name}" khỏi danh sách yêu thích của mình không?`,
        okText: "Đồng ý",
        okType: "danger", // Nút màu đỏ để cảnh báo hành động xóa
        cancelText: "Hủy",
        centered: true, // Hiện ở chính giữa màn hình cho dễ chú ý
        onOk() {
          dispatch(toggleWishlistLocal(_id));
        },
      });
    } else {
      // Nếu CHƯA THÍCH -> Thêm thẳng luôn cho nhanh
      dispatch(toggleWishlistLocal(_id));
    }
  };
  return (
    <div
      onClick={showDetails}
      className="bg-white w-full max-w-[280px] md:min-w-[240px] rounded-xl relative shadow-md overflow-hidden flex-shrink-1 transition-all hover:shadow-xl cursor-pointer"
    >
      <div className="h-[250px] md:h-[300px] overflow-hidden relative">
        <img
          src={fruit.image.url}
          alt={fruit.name}
          className="block w-full h-full object-cover"
        />
      </div>

      <div className="bg-[#c4cd38] rounded-lg absolute top-[220px] md:top-[270px] right-5 text-white font-montserrat text-3xl font-extrabold size-15 flex items-center justify-center shadow-md z-10">
        {num + 1 < 10 ? `0${num + 1}` : num + 1}
      </div>

      <div className="p-4 md:p-5 space-y-4">
        <h3 className="font-bold uppercase text-base md:text-lg text-gray-800 line-clamp-1">
          {fruit.name}
        </h3>
        <p className="text-[#908e89] text-xs md:text-sm line-clamp-2">
          Trái Cây Tươi Ngon – Gọt Sẵn, Tiện Lợi Mỗi Ngày
        </p>

        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleBuyNow}
            className="cursor-pointer uppercase font-bold text-[10px] md:text-xs border-2 rounded-3xl border-amber-600 w-full max-w-[180px] py-2 px-1 hover:bg-amber-600 hover:text-white transition-colors"
          >
            Mua ngay
          </button>
          <div
            onClick={handleFavoriteClick}
            className={`inline-flex cursor-pointer size-8 shrink-0 rounded-full border-2 transition-all duration-300 justify-center items-center 
              ${
                isFavorite
                  ? "border-red-500 bg-red-50"
                  : "border-[var(--color-green-button)] hover:bg-green-50"
              }`}
          >
            {isFavorite ? (
              // Icon khi ĐÃ yêu thích (Trái tim đỏ)
           
             <HeartOutlined  />
            ) : (
             
              // Icon khi CHƯA yêu thích (Dùng ảnh icon của bạn)
              <img src={favorite_icon} alt="icon" className="size-4" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;
