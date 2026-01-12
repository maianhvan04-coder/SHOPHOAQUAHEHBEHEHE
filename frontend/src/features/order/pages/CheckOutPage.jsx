import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Select, Spin } from "antd";
import { createNewOrder, resetOrderState } from "../order.slice";
import { phoneRegex } from "../../../shared/utils/validators";
import {
  getAddressSuggestions,
  getDistanceMatrix,
  getPlaceDetail,
} from "../../../api/external_api/goong.api";
import calculateShippingPrice from "../helpers/caculateShippingPrice";

const CheckoutPage = () => {
  const STORE_COORDS = { lat: 21.5755337, lng: 105.8126655 }; // Tecco tòa A2
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [addressData, setAddressData] = useState([]);
  const [wards, setWards] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Thêm state phí ship ---
  const [shippingPrice, setShippingPrice] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    fetch("/data/vietnam_provinces.json")
      .then((res) => res.json())
      .then((data) => setAddressData(data))
      .catch(() => message.error("Không thể tải dữ liệu địa chính!"));
  }, []);

  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  const orderItems = location.state?.orderItems || [];

  const { isSuccess, isLoading, currentOrder, errorMessage } = useSelector(
    (state) => state.order
  );

  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Tính toán tổng tiền mới dựa trên state shippingPrice
  const totalPrice = itemsPrice + shippingPrice;

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    addressDetails: "",
    customerNote: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleSearchAddress = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    if (value && value.length > 1) {
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        const predictions = await getAddressSuggestions(
          value,
          address.ward,
          address.province
        );
        setAddressSuggestions(
          predictions.map((item) => ({
            label: item.description,
            value: item.description,
            key: item.place_id, // Lưu ID để bốc tọa độ
          }))
        );
        setIsSearching(false);
      }, 500);
      setTypingTimeout(timeout);
    }
  };

  // --- CHỈ THÊM LOGIC NÀY VÀO HÀM SELECT CỦA BẠN ---
  const handleAddressSelect = async (val, option) => {
    setAddress({ ...address, addressDetails: val });
    const placeId = option.key;
    try {
      const locationCoords = await getPlaceDetail(placeId);
      if (locationCoords) {
        const origin = `${STORE_COORDS.lat},${STORE_COORDS.lng}`;
        const destination = `${locationCoords.lat},${locationCoords.lng}`;
        const matrix = await getDistanceMatrix(origin, destination);
        if (matrix && matrix.status === "OK") {
          const km = matrix.distance.value / 1000;
          setDistance(km);
          // Logic: 2km đầu 15k, mỗi km sau +5k
          let cost = calculateShippingPrice(km);
          setShippingPrice(cost);
        }
      }
    } catch (error) {
      setShippingPrice(20000); // Lỗi thì lấy mặc định
    }
  };

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

  const handleProvinceChange = (provinceCode, option) => {
    const selectedProvince = addressData.find((p) => p.code === provinceCode);
    setWards(selectedProvince ? selectedProvince.wards : []);
    setAddress({
      ...address,
      province: option.label,
      ward: "",
      addressDetails: "",
    });
    setShippingPrice(0); // Reset phí ship khi đổi vùng
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      message.warning("Giỏ hàng đang trống, hãy chọn sản phẩm trước nhé!");
      return;
    }
    if (
      !address.fullName.trim() ||
      !address.phone.trim() ||
      !address.province ||
      !address.ward ||
      !address.addressDetails.trim()
    ) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!phoneRegex.PHONE_VN.test(address.phone.trim())) {
      message.error("Số điện thoại không đúng định dạng!");
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
        <div className="space-y-6">
          {/* Box thông tin người nhận: GIỮ NGUYÊN GIAO DIỆN CỦA BẠN */}
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

              <Select
                showSearch
                placeholder="Chọn Tỉnh/Thành phố *"
                optionFilterProp="label"
                className="w-full h-[50px] rounded-xl"
                onChange={handleProvinceChange}
                options={addressData.map((p) => ({
                  label: p.name,
                  value: p.code,
                }))}
              />

              <Select
                showSearch
                placeholder="Chọn Phường/Xã/Thị trấn *"
                optionFilterProp="label"
                className="w-full h-[50px] rounded-xl"
                disabled={!address.province}
                value={address.ward || undefined}
                onChange={(val, opt) => {
                  setAddress({
                    ...address,
                    ward: opt.label,
                    addressDetails: "",
                  });
                  setAddressSuggestions([]);
                }}
                options={wards.map((w) => ({ label: w.name, value: w.code }))}
              />

              <div className="md:col-span-2">
                <Select
                  showSearch
                  placeholder="Số nhà, tên đường (Gợi ý từ bản đồ)... *"
                  className="w-full h-[50px] rounded-xl custom-goong-select"
                  filterOption={false}
                  onSearch={handleSearchAddress}
                  onChange={handleAddressSelect}
                  notFoundContent={isSearching ? <Spin size="small" /> : null}
                  options={addressSuggestions}
                  value={address.addressDetails || undefined}
                />
              </div>
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

          {/* Box phương thức thanh toán: GIỮ NGUYÊN GIAO DIỆN CỦA BẠN */}
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
                className="p-4 border-2 rounded-2xl transition-all flex flex-col gap-1 border-gray-100 opacity-50 cursor-not-allowed bg-gray-50"
                onClick={() =>
                  message.info("Tính năng thanh toán Online đang được bảo trì!")
                }
              >
                <span className="font-bold text-gray-400">
                  Thanh toán Online (Sắp ra mắt)
                </span>
                <span className="text-xs text-gray-400">
                  Chuyển khoản qua mã QR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Box tóm tắt đơn hàng: GIỮ NGUYÊN GIAO DIỆN CỦA BẠN */}
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
              <span>
                Phí vận chuyển {distance > 0 && `(${distance.toFixed(1)}km)`}:
              </span>
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
                : "bg-[#153a2e] hover:bg-[#1d4d3d] shadow-green-100"
            }`}
          >
            {isLoading ? (
              <>
                <Spin size="small" /> ĐANG XỬ LÝ...
              </>
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
