import apiClient from "../services/apiClient";

/**
 * Lấy danh sách feedback theo product (public)
 */
export const getFeedbacksByProductAPI = (productId, page = 1, limit = 10) => {
  const URL_API = `/api/v1/feedback/product/${productId}?page=${page}&limit=${limit}`;
  return apiClient.get(URL_API);
};

/**
 * Lấy rating summary của product (public)
 */
export const getProductRatingSummaryAPI = (productId) => {
  const URL_API = `/api/v1/feedback/product/${productId}/summary`;
  return apiClient.get(URL_API);
};

/**
 * Tạo feedback mới (private – user phải login)
 */
export const createFeedbackAPI = (data) => {
  // data = { productId, orderId, rating, comment, images }
  const URL_API = `/api/v1/feedback`;
  return apiClient.post(URL_API, data);
};

/**
 * Cập nhật feedback (private)
 */
export const updateFeedbackAPI = (feedbackId, data) => {
  // data = { rating?, comment?, images? }
  const URL_API = `/api/v1/feedback/${feedbackId}`;
  return apiClient.put(URL_API, data);
};

/**
 * Check user đã đánh giá product trong order chưa (private)
 */
export const checkFeedbackByOrderAndProductAPI = (orderId, productId) => {
  const URL_API = `/api/v1/feedback/check?orderId=${orderId}&productId=${productId}`;
  return apiClient.get(URL_API);
};
