import apiClient from "../services/apiClient";
export const createOrderAPI = (data) => {
  const URL_API = "/api/v1/order/me/create";
  return apiClient.post(URL_API, data);
};
export const getMyOrdersAPI = (status) => {
  const URL_API = "/api/v1/order/me";
  return apiClient.get(URL_API, {
    params: {
      status: status,
    },
  });
};
export const getOrderDetailAPI = (orderId) => {
  const URL_API = `/api/v1/order/me/${orderId}`;
  return apiClient.get(URL_API);
};
export const cancelOrderAPI = (orderId) => {
  const URL_API = `/api/v1/order/me/${orderId}/cancel`;
  return apiClient.patch(URL_API);
};
export const getAllOrdersAPI = () => {
  const URL_API = "api/v1/admin/order/all";
  return apiClient.get(URL_API);
};
export const updateOrderStatusAPI = (orderId, data) => {
  const URL_API = `api/v1/admin/order/update-status/${orderId}`;
  return apiClient.patch(URL_API, data);
};
