import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { EyeOutlined, StarFilled, EditOutlined } from "@ant-design/icons"; // Thêm icon Edit
import { checkFeedbackByOrderAndProduct } from "../feedback.thunk";

const FeedbackAction = ({ order, navigate }) => {
  const dispatch = useDispatch();
  const productId = order?.orderItems?.[0]?.product;
  const orderId = order?._id;
  const key = `${orderId}_${productId}`;

  const feedbackData = useSelector(
    (state) => state.feedback.orderFeedbackMap[key]
  );

  useEffect(() => {
    if (
      order?.status?.orderStatus === "Delivered" &&
      productId &&
      feedbackData === undefined
    ) {
      dispatch(checkFeedbackByOrderAndProduct({ orderId, productId }));
    }
  }, [key, feedbackData, order?.status?.orderStatus, productId, dispatch]);

  if (order?.status?.orderStatus !== "Delivered") return null;

  if (feedbackData === undefined) {
    return (
      <span className="text-xs text-gray-400 italic">Đang kiểm tra...</span>
    );
  }

  // LOGIC PHÂN LOẠI NÚT
  const hasFeedback = feedbackData !== null;
  const canEdit = hasFeedback && feedbackData.isUpdated === false;

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/feedback/order/${orderId}`, {
      state: { orderItems: order.orderItems, orderId: orderId },
    });
  };

  // Xác định Style dựa trên trạng thái
  const getButtonStyle = () => {
    if (!hasFeedback)
      return {
        bg: "#52c41a",
        color: "#fff",
        text: "Viết đánh giá",
        icon: <StarFilled />,
      };
    if (canEdit)
      return {
        bg: "#fa8c16",
        color: "#fff",
        text: "Sửa đánh giá",
        icon: <EditOutlined />,
      };
    return {
      bg: "#f6ffed",
      color: "#52c41a",
      text: "Xem đánh giá",
      icon: <EyeOutlined />,
      border: "1px solid #b7eb8f",
    };
  };

  const buttonConfig = getButtonStyle();

  return (
    <Button
      size="middle"
      icon={buttonConfig.icon}
      style={{
        borderRadius: "20px",
        backgroundColor: buttonConfig.bg,
        color: buttonConfig.color,
        border: buttonConfig.border || "none",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
      }}
      onClick={handleClick}
    >
      {buttonConfig.text}
    </Button>
  );
};

export default FeedbackAction;
