import { Input, Button, Divider, Spin, Empty, message, Modal } from "antd";
import {
  FaTrashAlt,
  FaShieldAlt,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaTicketAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// Import thêm các action từ slice của bạn
import {
  fetchCart,
  updateCartQuantity,
  deleteItemFromCart,
} from "../cart.slice";
import { useEffect } from "react";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalAmount, isLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (productId, currentQty, adjustment) => {
    const newQty = currentQty + adjustment;

    if (newQty < 1) return;

    dispatch(updateCartQuantity({ productId, quantity: newQty }))
      .unwrap()
      .catch((err) => {
        message.error(err || "Lỗi cập nhật");
        dispatch(fetchCart());
      });
  };

  const handleDeleteProduct = (productId) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk() {
        return dispatch(deleteItemFromCart(productId))
          .unwrap()
          .then(() => {
            message.success("Đã xóa khỏi giỏ hàng");
          })
          .catch((err) => {
            message.error(err || "Lỗi khi xóa");
          });
      },
    });
  };

  const shipping = items.length > 0 ? 30000 : 0;
  const total = totalAmount + shipping;

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-[#f9f9f9]">
        <Spin size="large" />
        <p className="mt-4 text-gray-400 font-medium">
          Đang tải giỏ hàng của bạn...
        </p>
      </div>
    );
  }

  return (
    <section className="bg-[#f9f9f9] min-h-[calc(100vh-200px)] pt-15 pb-4 px-4 md:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-extrabold uppercase mb-6 flex items-center gap-2">
          Giỏ hàng
          <span className="text-xs font-normal text-gray-400 lowercase">
            ({items.length} sản phẩm)
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-[65%] space-y-3">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.product?._id}
                  className="bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-50 transition-all hover:shadow-md"
                >
                  <div className="size-16 md:size-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={item.product?.image?.url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-bold text-[#49a760] mb-0.5">
                      Joygreen Fruit
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">
                      {item.product?.name}
                    </h3>
                    <p className="font-bold text-[#cea73d] text-xs md:hidden">
                      {item.product?.price?.toLocaleString()}đ
                    </p>
                  </div>

                  <div className="hidden md:block text-right min-w-[100px]">
                    <p className="font-bold text-base text-gray-800">
                      {item.subTotal?.toLocaleString()}đ
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {item.product?.price?.toLocaleString()}đ/đơn vị
                    </p>
                  </div>

                  {/* Cập nhật bộ điều khiển số lượng */}
                  <div className="flex items-center border border-gray-200 rounded-lg h-8">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.product?._id,
                          item.quantity,
                          -1
                        )
                      }
                      disabled={item.quantity <= 1}
                      className={`px-2 transition-colors ${
                        item.quantity <= 1
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <FaMinus size={8} />
                    </button>
                    <span className="px-3 font-bold text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.product?._id,
                          item.quantity,
                          1
                        )
                      }
                      className="px-2 hover:bg-gray-100 transition-colors"
                    >
                      <FaPlus size={8} />
                    </button>
                  </div>

                  {/* Cập nhật nút xóa */}
                  <button
                    onClick={() => handleDeleteProduct(item.product?._id)}
                    className="size-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-200">
                <Empty description="Giỏ hàng của bạn đang trống" />
                <Button
                  type="primary"
                  className="bg-[#49a760] border-none rounded-lg mt-4 h-10 px-8"
                  onClick={() => navigate("/")}
                >
                  TIẾP TỤC MUA SẮM
                </Button>
              </div>
            )}

            <button
              className="flex items-center gap-2 text-gray-400 hover:text-[#49a760] font-bold text-[11px] transition-colors mt-2"
              onClick={() => navigate("/")}
            >
              <FaArrowLeft /> QUAY LẠI MUA SẮM
            </button>
          </div>

          <div className="w-full lg:w-[35%]">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
              <h2 className="text-lg font-bold border-b pb-3 uppercase text-gray-700">
                Thanh toán
              </h2>

              <div className="space-y-2">
                <p className="text-[11px] font-bold flex items-center gap-2 text-gray-500">
                  <FaTicketAlt className="text-[#cea73d]" /> MÃ GIẢM GIÁ
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mã ưu đãi..."
                    className="rounded-lg h-9 text-xs"
                  />
                  <Button className="h-9 rounded-lg font-bold text-[11px] border-[#49a760] text-[#49a760] hover:!bg-[#49a760] hover:!text-white">
                    ÁP DỤNG
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-800">
                    {totalAmount?.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Phí ship</span>
                  <span className="font-semibold text-gray-800">
                    {shipping.toLocaleString()}đ
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800">
                    TỔNG CỘNG
                  </span>
                  <span className="font-black text-xl text-[#49a760]">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button
                disabled={items.length === 0}
                className={`w-full font-bold py-3 rounded-lg shadow-md transition-all text-xs uppercase tracking-widest ${
                  items.length > 0
                    ? "bg-[#1f4d3d] text-white hover:bg-[#153a2e]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Đặt hàng ngay
              </button>

              <div className="bg-[#f0f7f4] p-3 rounded-xl flex items-center gap-3 text-[#1f4d3d]">
                <FaShieldAlt size={18} className="shrink-0" />
                <p className="text-[10px] leading-tight">
                  Cam kết trái cây tươi ngon 100%, bảo mật thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
