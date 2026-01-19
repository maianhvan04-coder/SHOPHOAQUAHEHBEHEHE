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

// ====================== DASHBOARD ======================
// GET /api/v1/dashboard/order/month?month=2026-01&compare=1&staffId=...
export const getDashboardMonthAPI = (params) => {
  const URL_API = "/api/v1/dashboard/order/month";
  return apiClient.get(URL_API, { params });
};

export const getDashboardYearAPI = (params) => {
  const URL_API = "/api/v1/dashboard/order/year";
  return apiClient.get(URL_API, { params });
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
export function getShipperInboxAPI(params) {
  return apiClient.get("/api/v1/shipper/order/inbox", { params });
}

export function shipperClaimOrderAPI(orderId) {
  return apiClient.post(`/api/v1/shipper/order/claim/${orderId}`);
}

// ✅ Đơn tôi đang giao (bạn cần có endpoint này ở backend)
export function getMyShipperOrdersAPI(params) {
  return apiClient.get("/api/v1/shipper/order/my", { params });
  // Nếu backend bạn đặt khác, đổi đúng path:
  // "/api/v1/shipper/order/mine" hoặc "/api/v1/shipper/orders/my"...
}

export function shipperMarkDeliveredAPI(orderId) {
  return apiClient.post(`/api/v1/shipper/order/delivered/${orderId}`);
}

export function shipperCancelOrderAPI(orderId, payload) {
  // payload có thể { reason: "..." }
  return apiClient.post(`/api/v1/shipper/order/cancel/${orderId}`, payload);
}
