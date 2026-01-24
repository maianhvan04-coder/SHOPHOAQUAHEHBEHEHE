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
export const getAllOrdersAPI = (query) => {
  const URL_API = "api/v1/admin/order/all";
  return apiClient.get(URL_API, { params: query });
};
export const updateOrderStatusAPI = (orderId, data) => {
  const URL_API = `api/v1/admin/order/update-status/${orderId}`;
  return apiClient.patch(URL_API, data);
};

// ====================== STAFF ======================
// inbox đơn chưa gán staff: /api/v1/staff/order/unassigned?status=Pending
export const getUnassignedOrdersAPI = (params) => {
  const URL_API = "/api/v1/staff/order/unassigned";
  return apiClient.get(URL_API, { params });
};

// staff claim: PATCH /api/v1/staff/order/:id/claim
export const claimOrderAPI = (orderId) => {
  const URL_API = `/api/v1/staff/order/${orderId}/claim`;
  return apiClient.patch(URL_API);
};

// staff xem đơn của mình: GET /api/v1/staff/order?status=Pending&month=2026-01
export const getMyStaffOrdersAPI = (params) => {
  const URL_API = "/api/v1/staff/order";
  return apiClient.get(URL_API, { params });
};

// ====================== SH ======================

// 📥 Inbox đơn hàng cho shipper
export function getShipperInboxAPI(params) {
  return apiClient.get("/api/v1/shipper/order/inbox", { params });
}

// ✋ Shipper nhận đơn (CLAIM)
// Backend: PATCH /api/v1/shipper/order/:id/claim
export function shipperClaimOrderAPI(orderId) {
  return apiClient.patch(`/api/v1/shipper/order/${orderId}/claim`);
}

// 🚚 Đơn tôi đang giao
export function getMyShipperOrdersAPI(params) {
  return apiClient.get("/api/v1/shipper/order/my", { params });
}

// ✅ Đánh dấu đã giao
// Backend: POST /api/v1/shipper/order/delivered/:id
export function shipperMarkDeliveredAPI(orderId) {
  return apiClient.post(`/api/v1/shipper/order/delivered/${orderId}`);
}

// ❌ Hủy đơn
// Backend: POST /api/v1/shipper/order/cancel/:id
export function shipperCancelOrderAPI(orderId, payload) {
  return apiClient.post(`/api/v1/shipper/order/cancel/${orderId}`, payload);
}

