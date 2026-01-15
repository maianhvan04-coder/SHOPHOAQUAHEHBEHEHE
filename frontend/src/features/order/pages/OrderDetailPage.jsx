import React, { useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spin, Result, Steps, Divider, message, Modal } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { fetchOrderDetail, cancelOrder } from "../order.slice";
import FeedbackAction from "../../feedback/components/FeedbackAction";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { confirm } = Modal;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, isLoading, errorMessage } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(id));
    }
  }, [id, dispatch]);

  const getStepStatus = (status) => {
    const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];
    const currentIdx = steps.indexOf(status);
    return currentIdx === -1 ? 0 : currentIdx;
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" tip="Đang lấy chi tiết đơn hàng..." />
      </div>
    );

  if (errorMessage)
    return (
      <Result
        status="404"
        title="Lỗi"
        subTitle={errorMessage}
        extra={
          <Button onClick={() => navigate("/my-orders")}>
            Quay lại đơn hàng
          </Button>
        }
      />
    );
  const showCancelConfirm = () => {
    console.log("Đã gọi hàm này");
    confirm({
      title: "Xác nhận hủy đơn hàng?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
      okText: "Hủy đơn ngay",
      okType: "danger",
      cancelText: "Suy nghĩ lại",
      centered: true,
      async onOk() {
        try {
          const result = await dispatch(cancelOrder(id)).unwrap();
          message.success("Đã hủy đơn hàng thành công.");
          navigate("/my-orders");
        } catch (err) {
          message.error(err || "Không thể hủy đơn hàng lúc này.");
        }
      },
    });
  };
  if (!currentOrder) return null;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen pt-16">
      <div className="max-w-4xl mx-auto">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#49a760] transition-colors mb-6 font-medium"
        >
          <ArrowLeftOutlined /> Quay lại danh sách đơn hàng
        </button>

        {/* Header Đơn hàng */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-[#153a2e] uppercase">
              Đơn hàng: #{currentOrder._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <CalendarOutlined /> Ngày đặt:{" "}
              {new Date(currentOrder.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-400 block mb-1">
              Trạng thái hiện tại:
            </span>
            <span className="font-bold text-[#49a760] px-4 py-1 bg-green-50 rounded-full border border-green-100">
              {currentOrder.status?.orderStatus}
            </span>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <Steps
            current={getStepStatus(currentOrder.status?.orderStatus)}
            items={[
              { title: "Chờ xác nhận" },
              { title: "Đã xác nhận" },
              { title: "Đang giao" },
              { title: "Đã nhận hàng" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Thông tin sản phẩm và Địa chỉ */}
          <div className="md:col-span-2 space-y-6">
            {/* Địa chỉ nhận hàng */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <EnvironmentOutlined className="text-[#49a760]" /> Địa chỉ nhận
                hàng
              </h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">
                  {currentOrder.shippingAddress?.fullName}
                </p>
                <p>SĐT: {currentOrder.shippingAddress?.phone}</p>
                <p>
                  Tỉnh/Thành phố: {currentOrder.shippingAddress?.province} -
                  Phường/Xã: {currentOrder.shippingAddress?.ward}
                </p>
                <p>Địa chỉ: {currentOrder.shippingAddress?.addressDetails}</p>
                {currentOrder.customerNote && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm italic">
                    Ghi chú: {currentOrder.customerNote}
                  </div>
                )}
                {currentOrder.shopNote && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm italic">
                    Tin nhắn từ shop: {currentOrder.shopNote}
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                Sản phẩm đã đặt
              </h3>
              <div className="space-y-4">
                {currentOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      className="w-16 h-16 rounded-2xl object-cover border"
                      alt={item.name}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-700">
                      {item.price?.toLocaleString()}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải: Thanh toán */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <CreditCardOutlined className="text-[#49a760]" /> Thanh toán
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính:</span>
                  <span>{currentOrder.itemsPrice?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phí ship:</span>
                  <span>{currentOrder.shippingPrice?.toLocaleString()}đ</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 uppercase text-sm">
                    Tổng cộng:
                  </span>
                  <span className="text-xl font-black text-red-600">
                    {currentOrder.totalPrice?.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Phương thức
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {currentOrder.paymentMethod}
                </p>
                <div className="pt-2">
                  {currentOrder.status?.isPaid ? (
                    <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-md">
                      ĐÃ THANH TOÁN
                    </span>
                  ) : (
                    <span className="text-[10px] bg-orange-400 text-white px-2 py-1 rounded-md">
                      CHỜ THANH TOÁN
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2">
                {currentOrder.status?.orderStatus === "Delivered" && (
                  <FeedbackAction order={currentOrder} navigate={navigate} />
                )}
              </div>

              {/* Button Hủy đơn (Chỉ hiện khi đơn đang Pending) */}
              {currentOrder.status?.orderStatus === "Pending" && (
                <Button
                  danger
                  block
                  className="mt-6 h-12 rounded-2xl font-bold"
                  onClick={showCancelConfirm}
                >
                  Hủy đơn hàng
                </Button>
              )}
              {currentOrder.status?.orderStatus === "Cancelled" && (
                <div className="mt-6 p-3 bg-red-50 text-red-500 rounded-2xl text-center text-xs font-bold border border-red-100">
                  ĐƠN HÀNG ĐÃ BỊ HỦY
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
