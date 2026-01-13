import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Typography, message, Spin } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import FeedbackTag from "../components/FeedbackTag";
import { useDispatch, useSelector } from "react-redux";
import {
  checkFeedbackByOrderAndProduct,
  createFeedback,
  updateFeedback,
} from "../feedback.thunk";
import { getFeedbackUploadSignature } from "../../../api/uploadApi";
import axios from "axios";

const { Title, Text } = Typography;

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderFeedbackMap = useSelector(
    (state) => state.feedback.orderFeedbackMap
  );
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { orderItems, orderId } = location.state || {
    orderItems: [],
    orderId: null,
  };
  useEffect(() => {
    const fetchMissingFeedback = async () => {
      const promises = orderItems.map((item) => {
        const key = `${orderId}_${item.product}`;
        if (orderFeedbackMap[key] === undefined) {
          return dispatch(
            checkFeedbackByOrderAndProduct({ orderId, productId: item.product })
          );
        }
        return null;
      });

      await Promise.all(promises);
      setLoadingInitial(false);
    };

    if (orderId && orderItems.length > 0) {
      fetchMissingFeedback();
    }
  }, [orderId, orderItems, dispatch]);
  useEffect(() => {
    // Luôn cập nhật lại allFeedback bất cứ khi nào orderFeedbackMap thay đổi
    // Không cần check loadingInitial nữa để đảm bảo tính thời gian thực
    const newAllFeedback = orderItems.reduce((acc, item) => {
      const key = `${orderId}_${item.product}`;
      const savedData = orderFeedbackMap[key];
      if (savedData) {
        acc[item.product] = {
          rating: savedData.rating,
          comment: savedData.comment,
          fileList:
            savedData.images?.map((url, i) => ({
              uid: i,
              status: "done",
              url,
            })) || [],
          isReadonly: savedData.isUpdated === true,
          isEditMode: savedData.isUpdated === false,
        };
      } else {
        acc[item.product] = {
          rating: 5,
          comment: "",
          fileList: [],
          isReadonly: false,
          isEditMode: false,
        };
      }
      return acc;
    }, {});

    setAllFeedback(newAllFeedback);
  }, [orderFeedbackMap, orderItems, orderId]);
  const [allFeedback, setAllFeedback] = useState(() => {
    return orderItems.reduce((acc, item) => {
      const key = `${orderId}_${item.product}`;
      const savedData = orderFeedbackMap[key];
      if (savedData) {
        acc[item.product] = {
          rating: savedData.rating,
          comment: savedData.comment,
          fileList:
            savedData.images?.map((url, i) => ({
              uid: i,
              status: "done",
              url,
            })) || [],
          isReadonly: savedData.isUpdated === true,
          isEditMode: savedData.isUpdated === false,
        };
      } else {
        acc[item.product] = {
          rating: 5,
          comment: "",
          fileList: [],
          isReadonly: false,
          isEditMode: false,
        };
      }
      return acc;
    }, {});
  });

  const handleFieldChange = (productId, field, value) => {
    setAllFeedback((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const uploadToCloudinary = async (file, productId) => {
    const sigRes = await getFeedbackUploadSignature({ orderId, productId });
    const { signature, timestamp, apiKey, cloudName, folder, publicId } =
      sigRes.data;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return res.data.secure_url;
  };

  const processSingle = async (productId) => {
    const currentData = allFeedback[productId];
    const key = `${orderId}_${productId}`;
    const savedData = orderFeedbackMap[key]; // Lấy dữ liệu từ Redux Store
    const fId = savedData?._id;
    if (!currentData.comment.trim()) {
      message.warning("Vui lòng nhập nhận xét!");
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        currentData.fileList.map((file) =>
          file.originFileObj
            ? uploadToCloudinary(file.originFileObj, productId)
            : file.url
        )
      );
      const payload = {
        orderId,
        productId,
        rating: currentData.rating,
        comment: currentData.comment,
        images: imageUrls,
      };

      if (currentData.isEditMode && fId) {
        await dispatch(
          updateFeedback({ feedbackId: fId, data: payload })
        ).unwrap();
      } else {
        await dispatch(createFeedback(payload)).unwrap();
      }

      message.success("Thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    const pendingItems = orderItems.filter(
      (item) =>
        !allFeedback[item.product].isReadonly &&
        !allFeedback[item.product].isEditMode
    );
    setIsSubmitting(true);
    try {
      await Promise.all(
        pendingItems.map((item) => processSingle(item.product))
      );
      message.success("Đánh giá thành công!");
      navigate("/my-orders");
    } catch (error) {
      message.error("Lỗi khi gửi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId)
    return <div className="pt-24 text-center">Không tìm thấy đơn hàng.</div>;

  const pendingItems = orderItems.filter(
    (item) =>
      !allFeedback[item.product].isReadonly &&
      !allFeedback[item.product].isEditMode
  );
  const isAllFilled =
    pendingItems.length > 0 &&
    pendingItems.every(
      (item) => allFeedback[item.product].comment.trim() !== ""
    );
  const isViewOnly = Object.values(allFeedback).every((f) => f.isReadonly);

  return (
    <div className="bg-[#f9fafb] min-h-screen pt-12 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 mb-6 font-semibold"
        >
          <ArrowLeftOutlined /> QUAY LẠI
        </button>
        <Title level={2} className="!font-black !text-[#153a2e] uppercase mb-8">
          {isViewOnly ? "Chi tiết đánh giá" : "Đánh giá đơn hàng"}
        </Title>

        <div className="space-y-4">
          {orderItems.map((item) => (
            <FeedbackTag
              key={item.product}
              item={item}
              feedbackData={allFeedback[item.product]}
              onChange={handleFieldChange}
              isReadonly={allFeedback[item.product].isReadonly}
              isEditMode={allFeedback[item.product].isEditMode}
              onAction={() => processSingle(item.product)}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>

        {pendingItems.length > 1 && (
          <div className="mt-10 p-6 bg-white rounded-3xl shadow-xl flex justify-between items-center border border-green-50">
            <div>
              <div className="font-bold text-[#153a2e]">
                Đánh giá cho {pendingItems.length} sản phẩm
              </div>
              <Text type="secondary" className="text-xs">
                {isAllFilled ? "Sẵn sàng gửi" : "Vui lòng nhập đủ các mục"}
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              loading={isSubmitting}
              disabled={!isAllFilled}
              icon={<SendOutlined />}
              onClick={handleSubmitAll}
              className={`border-none rounded-2xl h-14 px-12 font-black shadow-lg ${
                !isAllFilled ? "bg-gray-200" : "bg-[#52c41a]"
              }`}
            >
              GỬI TẤT CẢ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
