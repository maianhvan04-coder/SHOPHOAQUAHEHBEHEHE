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
import {
  fetchCart,
  updateCartQuantity,
  deleteItemFromCart,
  updateQuantityLocal,
} from "../../../features/cart/cart.slice";
import { useEffect, useState, useMemo } from "react";
import { debounce } from "lodash";
const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.cart);
  const [excludedIds, setExcludedIds] = useState(() => {
    const saved = sessionStorage.getItem("excluded_cart_items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0) {
      const currentItemIds = items.map((i) => i.product?._id);
      setExcludedIds((prev) =>
        prev.filter((id) => currentItemIds.includes(id))
      );
    }
  }, [items]);

  const selectedIds = useMemo(() => {
    return items
      .map((item) => item.product?._id)
      .filter((id) => !excludedIds.includes(id));
  }, [items, excludedIds]);

  const { subTotalSelected, totalQtySelected } = useMemo(() => {
    const selectedData = items.filter((item) =>
      selectedIds.includes(item.product?._id)
    );
    return {
      subTotalSelected: selectedData.reduce(
        (sum, item) => sum + (item.subTotal || 0),
        0
      ),
      totalQtySelected: selectedData.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      ),
    };
  }, [items, selectedIds]);

  const shipping = totalQtySelected > 0 ? 5000 : 0;
  const totalFinal = subTotalSelected + shipping;

  const toggleSelectProduct = (productId) => {
    setExcludedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setExcludedIds(items.map((item) => item.product?._id));
    } else {
      setExcludedIds([]);
    }
  };
  const debouncedUpdateAPI = useMemo(
    () =>
      debounce((productId, newQty, dispatch) => {
        dispatch(updateCartQuantity({ productId, quantity: newQty }))
          .unwrap()
          .catch((err) => {
            message.error(err || "Số lượng không hợp lệ hoặc hết hàng");

            dispatch(fetchCart());
          });
      }, 500),
    []
  );
  useEffect(() => {
    return () => debouncedUpdateAPI.cancel();
  }, [debouncedUpdateAPI]);
  const handleUpdateQuantity = (productId, currentQty, adjustment) => {
    const newQty = currentQty + adjustment;
    if (newQty < 1) return;

    dispatch(updateQuantityLocal({ productId, quantity: newQty }));

    debouncedUpdateAPI(productId, newQty, dispatch);
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
            setExcludedIds((prev) => prev.filter((id) => id !== productId));
          })
          .catch((err) =>
            message.error(typeof err === "string" ? err : "Lỗi khi xóa")
          );
      },
    });
  };
  const handleGoToCheckout = () => {
    const selectedProducts = items
      .filter((item) => selectedIds.includes(item.product?._id))
      .map((item) => ({
        product: item.product?._id,
        name: item.product?.name,
        image: item.product?.image?.url,
        price: item.product?.price,
        quantity: item.quantity,
        subTotal: item.subTotal, // Lấy trực tiếp từ Backend trả về
      }));

    if (selectedProducts.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    navigate("/checkout", {
      state: {
        orderItems: selectedProducts,
        subTotal: subTotalSelected,
        shipping: shipping,
        totalAmount: totalFinal,
      },
    });
  };
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
          <div className="w-full lg:w-[65%]">
            {items.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-gray-50">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#49a760] cursor-pointer"
                    checked={
                      items.length > 0 && selectedIds.length === items.length
                    }
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm font-bold text-gray-600">
                    Chọn tất cả ({items.length})
                  </span>
                </div>

                <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {items.map((item) => (
                    <div
                      key={item.product?._id}
                      className={`bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center gap-4 border transition-all ${
                        selectedIds.includes(item.product?._id)
                          ? "border-[#49a760]"
                          : "border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#49a760] cursor-pointer shrink-0"
                        checked={selectedIds.includes(item.product?._id)}
                        onChange={() => toggleSelectProduct(item.product?._id)}
                      />

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
                      </div>

                      <div className="hidden md:block text-right min-w-[100px]">
                        <p className="font-bold text-base text-gray-800">
                          {item.subTotal?.toLocaleString()}đ
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {item.product?.price?.toLocaleString()}đ/phần
                        </p>
                      </div>

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
                          className="px-2 disabled:opacity-30"
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
                          className="px-2 hover:bg-gray-100"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(item.product?._id)}
                        className="size-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 transition-all"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                description="Giỏ hàng trống"
                className="bg-white p-10 rounded-xl"
              />
            )}

            <button
              className="flex items-center gap-2 text-gray-400 hover:text-[#49a760] font-bold text-[11px] mt-4"
              onClick={() => navigate("/")}
            >
              <FaArrowLeft /> QUAY LẠI MUA SẮM
            </button>
          </div>

          <div className="w-full lg:w-[35%]">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4 sticky top-20">
              <h2 className="text-lg font-bold border-b pb-3 uppercase text-gray-700">
                Hóa đơn
              </h2>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tạm tính ({totalQtySelected} món chọn)</span>
                  <span className="font-semibold text-gray-800">
                    {subTotalSelected.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Phí vận chuyển</span>
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
                    {totalFinal.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button
                disabled={selectedIds.length === 0}
                className="w-full font-bold py-3 rounded-lg shadow-md text-xs uppercase bg-[#1f4d3d] text-white hover:bg-[#153a2e] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={handleGoToCheckout}
              >
                Đặt hàng ngay
              </button>

              <div className="bg-[#f0f7f4] p-3 rounded-xl flex items-center gap-3 text-[#1f4d3d]">
                <FaShieldAlt size={18} />
                <p className="text-[10px]">
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
