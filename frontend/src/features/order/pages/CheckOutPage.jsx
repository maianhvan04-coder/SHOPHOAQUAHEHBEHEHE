import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { createNewOrder, resetOrderState } from "../order.slice";
import { current } from "@reduxjs/toolkit";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);
  const orderItems = location.state?.orderItems || [];

  const { isSuccess, isLoading, currentOrder, errorMessage } = useSelector(
    (state) => state.order
  );

  const shippingPrice = orderItems.length > 0 ? 30000 : 0;
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalPrice = itemsPrice + shippingPrice;

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressDetails: "",
    customerNote: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (isSuccess && currentOrder) {
      if (currentOrder.paymentMethod === "PayPal") {
        navigate(`/payment/${currentOrder._id}`);
      } else {
        message.success("Đặt hàng thành công! Joygreen sẽ sớm liên hệ bạn.");

        navigate(`/order-detail/${currentOrder._id}`);
      }
      dispatch(resetOrderState());
    }

    if (errorMessage) {
      message.error(errorMessage);
      dispatch(resetOrderState());
    }
  }, [isSuccess, currentOrder, errorMessage, navigate, dispatch]);

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      message.warning("Giỏ hàng đang trống, hãy chọn sản phẩm trước nhé!");
      return;
    }

    if (!address.fullName || !address.phone || !address.addressDetails) {
      message.error(
        "Vui lòng điền đầy đủ thông tin để chúng mình giao hàng tận nơi!"
      );
      return;
    }

    const orderData = {
      orderItems: orderItems.map((item) => ({
        product: item.product,
      
        quantity: item.quantity,
      })),
      shippingAddress: { ...address },
      paymentMethod,
      shippingPrice,
      itemsPrice,
      totalPrice,
      customerNote: address.customerNote,
    };

    dispatch(createNewOrder(orderData));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen pt-24">
      <h1 className="text-3xl font-extrabold mb-8 text-[#153a2e] text-center lg:text-left uppercase tracking-tight">
        Xác nhận đơn hàng
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* BÊN TRÁI: THÔNG TIN NHẬN HÀNG */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">
              Thông tin người nhận
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Họ và tên người nhận *"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#49a760] outline-none transition-all"
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Số điện thoại *"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#49a760] outline-none transition-all"
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
              />
              <textarea
                placeholder="Địa chỉ giao hàng chi tiết (Số nhà, tên đường...) *"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#49a760] outline-none md:col-span-2"
                rows="3"
                onChange={(e) =>
                  setAddress({ ...address, addressDetails: e.target.value })
                }
              ></textarea>
              <input
                type="text"
                placeholder="Ghi chú thêm về đơn hàng..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#49a760] outline-none md:col-span-2"
                onChange={(e) =>
                  setAddress({ ...address, customerNote: e.target.value })
                }
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">
              Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 ${
                  paymentMethod === "COD"
                    ? "border-[#49a760] bg-green-50"
                    : "border-gray-100 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("COD")}
              >
                <span className="font-bold text-gray-800">Tiền mặt (COD)</span>
                <span className="text-xs text-gray-500">
                  Thanh toán khi nhận hoa quả
                </span>
              </div>
              <div
                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 ${
                  paymentMethod === "PayPal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("PayPal")}
              >
                <span className="font-bold text-gray-800">
                  Thanh toán Online
                </span>
                <span className="text-xs text-gray-500">
                  Chuyển khoản qua mã QR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-28">
          <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">
            Giỏ hàng của bạn
          </h2>
          <div className="space-y-4 max-h-[350px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-4 border-b border-gray-50 pb-4 last:border-0"
              >
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-100"
                    alt={item.name}
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-[#49a760]">
                  {(item.price * item.quantity).toLocaleString()}đ
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between text-gray-600 text-sm font-medium">
              <span>Tạm tính:</span>
              <span>{itemsPrice.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm font-medium">
              <span>Phí vận chuyển:</span>
              <span>{shippingPrice.toLocaleString()}đ</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
              <span className="font-bold text-gray-800 uppercase">
                Tổng cộng:
              </span>
              <span className="text-2xl font-black text-red-600">
                {totalPrice.toLocaleString()}đ
              </span>
            </div>
          </div>

          <button
            disabled={isLoading || orderItems.length === 0}
            onClick={handlePlaceOrder}
            className={`w-full mt-8 py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : paymentMethod === "PayPal"
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                : "bg-[#153a2e] hover:bg-[#1d4d3d] shadow-green-100"
            }`}
          >
            {isLoading ? (
              <>
                <Spin size="small" /> ĐANG XỬ LÝ...
              </>
            ) : paymentMethod === "PayPal" ? (
              "TIẾP TỤC THANH TOÁN"
            ) : (
              "XÁC NHẬN ĐẶT HÀNG"
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400 mt-4 italic">
            * Vui lòng kiểm tra kỹ thông tin trước khi nhấn đặt hàng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
