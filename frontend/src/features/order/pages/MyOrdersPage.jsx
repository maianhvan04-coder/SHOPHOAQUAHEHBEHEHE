import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, Tabs, Tag } from "antd";
import { FaShoppingBag, FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { fetchMyOrders } from "../order.slice";

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(""); 

  const { orders, isLoading } = useSelector((state) => state.order);

 
  useEffect(() => {
    dispatch(fetchMyOrders(activeStatus));
  }, [dispatch, activeStatus]);


  const statusTabs = [
    { key: "", label: "Tất cả", icon: <FaShoppingBag /> },
    { key: "Pending", label: "Chờ xác nhận", icon: <FaBox className="text-orange-400" /> },
    { key: "Shipped", label: "Đang giao", icon: <FaTruck className="text-blue-400" /> },
    { key: "Delivered", label: "Đã giao", icon: <FaCheckCircle className="text-green-500" /> },
    { key: "Cancelled", label: "Đã hủy", icon: <FaTimesCircle className="text-red-400" /> },
  ];

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-[#153a2e] mb-6 flex items-center gap-3">
          <FaShoppingBag /> ĐƠN HÀNG CỦA TÔI
        </h1>

     
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-2 overflow-x-auto">
          <div className="flex justify-between min-w-[500px]">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeStatus === tab.key
                    ? "bg-green-50 text-[#49a760] shadow-inner"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nội dung danh sách */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : orders?.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl shadow-sm text-center">
            <Empty description="Bạn không có đơn hàng nào ở trạng thái này." />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/order-detail/${order._id}`)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header đơn hàng */}
                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400">ID: {order._id.toUpperCase()}</span>
                    <p className="text-xs text-gray-500 font-medium">
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Tag color={order.status.orderStatus === "Delivered" ? "green" : "orange"} className="rounded-full px-3 font-bold uppercase text-[10px]">
                    {order.status.orderStatus}
                  </Tag>
                </div>

                {/* Danh sách SP tóm tắt */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={order.orderItems[0]?.image}
                      alt="fruit"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                    />
                    {order.orderItems.length > 1 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {order.orderItems.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 line-clamp-1">{order.orderItems[0]?.name}</p>
                    <p className="text-xs text-gray-400 italic">
                      Phương thức: {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-medium">Tổng tiền</p>
                    <p className="text-lg font-black text-red-600">
                      {order.totalPrice.toLocaleString()}đ
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                   <span className="text-[#49a760] text-xs font-bold group-hover:translate-x-1 transition-transform">
                     Xem chi tiết đơn hàng →
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;